/**
 * YUMMY Restaurant - Admin Setup Script
 * Script để tạo admin user đầu tiên và setup dữ liệu ban đầu
 */

import { YummyFirebaseService } from './firebase-service.js';

class AdminSetup {
  constructor() {
    this.firebaseService = new YummyFirebaseService();
  }

  /**
   * Setup admin user đầu tiên
   */
  async setupFirstAdmin(email, password, adminData = {}) {
    try {
      console.log('🔧 Setting up first admin user...');
      
      // Tạo admin account
      const adminUser = await this.firebaseService.signUp(email, password, {
        ...adminData,
        role: 'admin',
        isFirstAdmin: true,
        setupDate: new Date().toISOString()
      });

      if (adminUser.success) {
        // Thêm vào admin collection
        await this.firebaseService.addAdminUser(adminUser.user.uid, {
          email: email,
          role: 'admin',
          permissions: ['menu_management', 'table_management', 'order_management', 'user_management'],
          createdAt: new Date().toISOString(),
          isActive: true
        });

        console.log('✅ Admin user created successfully!');
        return { success: true, adminId: adminUser.user.uid };
      } else {
        throw new Error(adminUser.error);
      }
    } catch (error) {
      console.error('❌ Error setting up admin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup dữ liệu mẫu cho restaurant
   */
  async setupSampleData() {
    try {
      console.log('🔧 Setting up sample data...');

      // Sample categories
      const categories = [
        { name: 'Món Chính', description: 'Các món ăn chính', isActive: true },
        { name: 'Món Phụ', description: 'Các món ăn phụ', isActive: true },
        { name: 'Đồ Uống', description: 'Nước uống các loại', isActive: true },
        { name: 'Tráng Miệng', description: 'Món tráng miệng', isActive: true }
      ];

      // Sample menu items  
      const menuItems = [
        {
          name: 'Phở Bò Tái',
          description: 'Phở bò tái thơm ngon, nước dùng đậm đà',
          price: 65000,
          category: 'Món Chính',
          imageUrl: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400',
          isAvailable: true,
          prepTime: 15
        },
        {
          name: 'Bún Chả Hà Nội',
          description: 'Bún chả truyền thống Hà Nội với thịt nướng thơm phức',
          price: 55000,
          category: 'Món Chính', 
          imageUrl: 'https://images.unsplash.com/photo-1559847844-d8929c1313e9?w=400',
          isAvailable: true,
          prepTime: 20
        },
        {
          name: 'Cơm Tấm Sài Gòn',
          description: 'Cơm tấm sườn nướng đặc sản Sài Gòn',
          price: 45000,
          category: 'Món Chính',
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
          isAvailable: true,
          prepTime: 18
        },
        {
          name: 'Bánh Mì Thịt Nướng',
          description: 'Bánh mì giòn với thịt nướng thơm ngon',
          price: 25000,
          category: 'Món Phụ',
          imageUrl: 'https://images.unsplash.com/photo-1591814436616-95e3e7aa0e04?w=400',
          isAvailable: true,
          prepTime: 10
        },
        {
          name: 'Cà Phê Sữa Đá',
          description: 'Cà phê sữa đá truyền thống Việt Nam',
          price: 20000,
          category: 'Đồ Uống',
          imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
          isAvailable: true,
          prepTime: 5
        },
        {
          name: 'Chè Ba Màu',
          description: 'Chè ba màu mát lạnh, ngọt thanh',
          price: 18000,
          category: 'Tráng Miệng',
          imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400',
          isAvailable: true,
          prepTime: 8
        }
      ];

      // Sample tables
      const tables = [
        { number: 1, capacity: 2, location: 'Tầng 1', status: 'available' },
        { number: 2, capacity: 4, location: 'Tầng 1', status: 'available' },
        { number: 3, capacity: 6, location: 'Tầng 1', status: 'available' },
        { number: 4, capacity: 2, location: 'Tầng 2', status: 'available' },
        { number: 5, capacity: 4, location: 'Tầng 2', status: 'available' },
        { number: 6, capacity: 8, location: 'Tầng 2', status: 'available' }
      ];

      // Add categories
      console.log('Adding categories...');
      for (const category of categories) {
        await this.firebaseService.addCategory(category);
      }

      // Add menu items
      console.log('Adding menu items...');
      for (const item of menuItems) {
        await this.firebaseService.addMenuItem(item);
      }

      // Add tables
      console.log('Adding tables...');
      for (const table of tables) {
        await this.firebaseService.createTable(table);
      }

      console.log('✅ Sample data setup completed!');
      return { success: true };

    } catch (error) {
      console.error('❌ Error setting up sample data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset toàn bộ dữ liệu (chỉ dùng khi development)
   */
  async resetAllData() {
    try {
      console.log('🔄 Resetting all data...');
      
      // Delete all collections
      const collections = ['menuItems', 'tables', 'orders', 'categories'];
      
      for (const collectionName of collections) {
        const items = await this.firebaseService.getAllFromCollection(collectionName);
        for (const item of items) {
          await this.firebaseService.deleteFromCollection(collectionName, item.id);
        }
      }

      console.log('✅ All data reset completed!');
      return { success: true };

    } catch (error) {
      console.error('❌ Error resetting data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export để sử dụng trong console hoặc script khác
window.AdminSetup = AdminSetup;

// Auto-setup function cho development
window.setupYummyRestaurant = async function(adminEmail, adminPassword) {
  const setup = new AdminSetup();
  
  console.log('🚀 Starting Yummy Restaurant setup...');
  
  // Setup admin
  const adminResult = await setup.setupFirstAdmin(adminEmail, adminPassword, {
    displayName: 'Restaurant Admin',
    phone: '+84987654321'
  });
  
  if (adminResult.success) {
    // Setup sample data
    await setup.setupSampleData();
    console.log('🎉 Yummy Restaurant setup completed!');
    console.log('👨‍💼 Admin Email:', adminEmail);
    console.log('🔐 Admin Password:', adminPassword);
    console.log('📱 You can now login to admin dashboard!');
  } else {
    console.error('❌ Setup failed:', adminResult.error);
  }
};

console.log('🍜 Yummy Restaurant Admin Setup loaded!');
console.log('📝 To setup restaurant, run: setupYummyRestaurant("admin@yummy.com", "password123")');