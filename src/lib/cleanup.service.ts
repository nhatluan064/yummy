import { orderService } from "./order.service";
import { billService } from "./bill.service";
import { Timestamp } from "firebase/firestore";

/**
 * Service để tự động dọn dẹp dữ liệu cũ
 * 
 * Quy tắc:
 * - Đơn hàng "cancelled" hoặc "test": Xóa sau 7 ngày
 * - Đơn hàng "completed": Giữ 1 năm, sau đó archive
 * - Bills: Giữ 1 năm, sau đó tạo báo cáo tổng hợp rồi archive
 */

class CleanupService {
  /**
   * Xóa các đơn hàng đã hủy cũ hơn 7 ngày
   */
  async cleanupCancelledOrders() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cancelledOrders = await orderService.getAll([
        orderService.by('status', '==', 'cancelled'),
      ]);

      const toDelete = cancelledOrders.filter(order => {
        const createdAt = (order.createdAt as Timestamp)?.toDate?.() || new Date();
        return createdAt < sevenDaysAgo;
      });

      for (const order of toDelete) {
        if (order.id) {
          await orderService.delete(order.id);
          console.log(`Deleted cancelled order: ${order.orderCode}`);
        }
      }

      return { deleted: toDelete.length };
    } catch (error) {
      console.error('Error cleaning up cancelled orders:', error);
      throw error;
    }
  }

  /**
   * Archive các đơn hàng completed cũ hơn 1 năm
   * Chuyển sang collection "orders_archive"
   */
  async archiveOldCompletedOrders() {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const completedOrders = await orderService.getAll([
        orderService.by('status', '==', 'completed'),
      ]);

      const toArchive = completedOrders.filter(order => {
        const createdAt = (order.createdAt as Timestamp)?.toDate?.() || new Date();
        return createdAt < oneYearAgo;
      });

      // TODO: Move to archive collection
      // For now, just log
      console.log(`${toArchive.length} orders ready for archive`);

      return { archived: toArchive.length };
    } catch (error) {
      console.error('Error archiving orders:', error);
      throw error;
    }
  }

  /**
   * Tạo báo cáo tháng từ các bills
   * Lưu vào collection "monthly_reports"
   */
  async createMonthlyReport(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const bills = await billService.getAll([]);
      
      const monthBills = bills.filter(bill => {
        const createdAt = (bill.createdAt as Timestamp)?.toDate?.() || new Date();
        return createdAt >= startDate && createdAt <= endDate;
      });

      const report = {
        year,
        month,
        totalRevenue: monthBills.reduce((sum, b) => sum + b.totalAmount, 0),
        totalOrders: monthBills.length,
        averageOrderValue: monthBills.length > 0 
          ? monthBills.reduce((sum, b) => sum + b.totalAmount, 0) / monthBills.length 
          : 0,
        createdAt: new Date(),
      };

      console.log(`Monthly report ${year}-${month}:`, report);
      return report;
    } catch (error) {
      console.error('Error creating monthly report:', error);
      throw error;
    }
  }

  /**
   * Chạy toàn bộ cleanup tasks
   */
  async runCleanup() {
    console.log('🧹 Starting cleanup...');
    
    const results = {
      cancelledDeleted: 0,
      ordersArchived: 0,
    };

    try {
      // 1. Xóa đơn hủy cũ
      const cancelled = await this.cleanupCancelledOrders();
      results.cancelledDeleted = cancelled.deleted;

      // 2. Archive đơn completed cũ
      const archived = await this.archiveOldCompletedOrders();
      results.ordersArchived = archived.archived;

      console.log('✅ Cleanup completed:', results);
      return results;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }
}

export const cleanupService = new CleanupService();
