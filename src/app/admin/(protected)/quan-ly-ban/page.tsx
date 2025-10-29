"use client";
import { useState, useEffect } from "react";
import { tableService, Table } from "@/lib/table.service";
import { useToast } from "@/app/components/Toast";

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableNumber, setEditTableNumber] = useState("");
  
  const toast = useToast();

  // Load tables
  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getAllTables();
      setTables(data);
    } catch (error) {
      console.error("Error loading tables:", error);
      toast.showToast("Không thể tải danh sách bàn", 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Tạo bàn mới
  const handleCreateTable = async () => {
    if (!newTableNumber.trim()) {
      toast.showToast("Vui lòng nhập số bàn", 2000);
      return;
    }

    // Kiểm tra trùng số bàn
    if (tables.some((t) => t.tableNumber === newTableNumber.trim())) {
      toast.showToast("Số bàn đã tồn tại", 2000);
      return;
    }

    try {
      await tableService.createTable(newTableNumber.trim());
      toast.showToast(`Đã tạo bàn ${newTableNumber}`, 2000);
      setNewTableNumber("");
      setShowAddModal(false);
      loadTables();
    } catch (error) {
      console.error("Error creating table:", error);
      toast.showToast("Không thể tạo bàn", 3000);
    }
  };

  // Xóa bàn
  const handleDeleteTable = async (table: Table) => {
    if (!confirm(`Bạn có chắc muốn xóa ${table.tableNumber}?`)) return;

    try {
      if (table.id) {
        await tableService.deleteTable(table.id);
        toast.showToast(`Đã xóa ${table.tableNumber}`, 2000);
        loadTables();
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.showToast("Không thể xóa bàn", 3000);
    }
  };

  // Cập nhật số bàn
  const handleUpdateTableNumber = async () => {
    if (!editTableNumber.trim() || !editingTable?.id) return;

    // Kiểm tra trùng số bàn
    if (
      tables.some(
        (t) => t.tableNumber === editTableNumber.trim() && t.id !== editingTable.id
      )
    ) {
      toast.showToast("Số bàn đã tồn tại", 2000);
      return;
    }

    try {
      await tableService.updateTableNumber(editingTable.id, editTableNumber.trim());
      toast.showToast("Đã cập nhật số bàn", 2000);
      setEditingTable(null);
      setEditTableNumber("");
      loadTables();
    } catch (error) {
      console.error("Error updating table:", error);
      toast.showToast("Không thể cập nhật bàn", 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Quản Lý Tạo Bàn
          </h1>
          <p className="text-neutral-600 mt-1">
            Xem và quản lý các đơn đặt bàn của khách hàng
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo Bàn Mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Tổng Số Bàn</p>
              <p className="text-3xl font-bold text-neutral-900">{tables.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Bàn Trống</p>
              <p className="text-3xl font-bold text-green-600">
                {tables.filter((t) => t.status === "empty").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Đang Sử Dụng</p>
              <p className="text-3xl font-bold text-primary-600">
                {tables.filter((t) => t.status === "occupied").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Đang tải...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="card p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-neutral-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">
            Chưa Có Bàn Nào
          </h3>
          <p className="text-neutral-600 mb-6">
            Nhấn nút "Tạo Bàn Mới" để bắt đầu
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`relative group card p-6 text-center cursor-pointer transition-all hover:scale-105 ${
                table.status === "empty"
                  ? "bg-white border-2 border-primary-200"
                  : "bg-gradient-to-br from-primary-500 to-primary-600 text-white border-2 border-primary-600"
              }`}
            >
              <div className="text-3xl font-bold mb-2">
                {table.tableNumber}
              </div>
              <div className={`text-sm font-medium ${
                table.status === "empty" ? "text-neutral-600" : "text-white/90"
              }`}>
                {table.status === "empty" ? "Bàn Trống" : "Đang Sử Dụng"}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTable(table);
                    setEditTableNumber(table.tableNumber);
                  }}
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                  title="Sửa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTable(table);
                  }}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                  title="Xóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Tạo Bàn Mới
            </h2>
            <div className="mb-6">
              <label className="block text-neutral-700 font-medium mb-2">
                Số Bàn *
              </label>
              <input
                type="text"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="VD: B01, B02, B03..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && handleCreateTable()}
              />
              <p className="text-sm text-neutral-500 mt-2">
                Nhập số bàn (ví dụ: B01, B02, A1, A2...)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTableNumber("");
                }}
                className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTable}
                className="flex-1 btn-primary"
              >
                Tạo Bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Sửa Số Bàn
            </h2>
            <div className="mb-6">
              <label className="block text-neutral-700 font-medium mb-2">
                Số Bàn Mới *
              </label>
              <input
                type="text"
                value={editTableNumber}
                onChange={(e) => setEditTableNumber(e.target.value)}
                placeholder="VD: B01, B02, B03..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && handleUpdateTableNumber()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingTable(null);
                  setEditTableNumber("");
                }}
                className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateTableNumber}
                className="flex-1 btn-primary"
              >
                Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
