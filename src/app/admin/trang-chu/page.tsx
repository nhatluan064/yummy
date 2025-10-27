"use client";

export default function AdminHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Chào mừng đến trang quản trị
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Quản lý đơn hàng, đặt bàn và thông tin nhà hàng của bạn từ một nơi duy nhất
        </p>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đơn hàng chờ xử lý</p>
              <h3 className="text-2xl font-bold text-gray-800">--</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đặt bàn hôm nay</p>
              <h3 className="text-2xl font-bold text-gray-800">--</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Phản hồi mới</p>
              <h3 className="text-2xl font-bold text-gray-800">--</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Liên hệ chưa đọc</p>
              <h3 className="text-2xl font-bold text-gray-800">--</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <svg className="w-8 h-8 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Xem đơn hàng mới</h3>
            <p className="text-gray-600">Kiểm tra và xử lý các đơn hàng mới nhất</p>
          </button>

          <button className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <svg className="w-8 h-8 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý đặt bàn</h3>
            <p className="text-gray-600">Xem và quản lý lịch đặt bàn</p>
          </button>

          <button className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <svg className="w-8 h-8 text-yellow-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cập nhật thực đơn</h3>
            <p className="text-gray-600">Thêm, sửa hoặc xóa các món trong thực đơn</p>
          </button>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hoạt động gần đây</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center text-gray-600">
            Chức năng đang được phát triển...
          </div>
        </div>
      </section>
    </div>
  );
}