// src/app/thuc-don/page.tsx
import MenuItem from "@/app/components/MenuItem";
import Image from "next/image";

const menuData = [
  {
    id: 1,
    name: "Phở Bò Đặc Biệt",
    description: "Nước dùng đậm đà từ xương bò ninh 24 tiếng, thịt bò tươi ngon tuyển chọn",
    price: 65000,
    imageUrl: "https://via.placeholder.com/400x256/DC2626/ffffff?text=Ph%E1%BB%9F+B%C3%B2",
  },
  {
    id: 2,
    name: "Bún Chả Hà Nội",
    description: "Chả nướng thơm lừng trên than hoa, nước mắm chua ngọt đậm đà",
    price: 50000,
    imageUrl: "https://via.placeholder.com/400x256/F59E0B/ffffff?text=B%C3%BAn+Ch%E1%BA%A3",
  },
  {
    id: 3,
    name: "Cơm Tấm Sườn Bì Chả",
    description: "Sườn cốt lết nướng mềm ngọt, bì dai giòn, chả trứng hấp thơm",
    price: 55000,
    imageUrl: "https://via.placeholder.com/400x256/10B981/ffffff?text=C%C6%A1m+T%E1%BA%A5m",
  },
  {
    id: 4,
    name: "Bánh Mì Heo Quay",
    description: "Da giòn rụm, thịt mềm ngọt, kết hợp với đồ chua thanh mát",
    price: 30000,
    imageUrl: "https://via.placeholder.com/400x256/8B5CF6/ffffff?text=B%C3%A1nh+M%C3%AC",
  },
  {
    id: 5,
    name: "Gỏi Cuốn Tôm Thịt",
    description: "Bánh tráng mỏng trong suốt, tôm tươi, thịt luộc và rau sống",
    price: 35000,
    imageUrl: "https://via.placeholder.com/400x256/06B6D4/ffffff?text=G%E1%BB%8Fi+Cu%E1%BB%91n",
  },
  {
    id: 6,
    name: "Chả Cá Lã Vọng",
    description: "Cá lăng tươi, nướng với nghệ và thì là, ăn kèm bún và rau thơm",
    price: 75000,
    imageUrl: "https://via.placeholder.com/400x256/EF4444/ffffff?text=Ch%E1%BA%A3+C%C3%A1",
  },
  {
    id: 7,
    name: "Bánh Xèo Miền Tây",
    description: "Bánh vàng óng, nhân tôm thịt đầy đặn, ăn cùng rau sống và nước chấm",
    price: 45000,
    imageUrl: "https://via.placeholder.com/400x256/F97316/ffffff?text=B%C3%A1nh+X%C3%A8o",
  },
  {
    id: 8,
    name: "Nem Nướng Nha Trang",
    description: "Nem nướng thơm ngon, ăn kèm bánh hỏi và rau sống, chấm tương",
    price: 60000,
    imageUrl: "https://via.placeholder.com/400x256/84CC16/ffffff?text=Nem+N%C6%B0%E1%BB%9Bng",
  },
  {
    id: 9,
    name: "Canh Chua Cá Basa",
    description: "Canh chua đậm đà, cá basa tươi ngon, thơm mùi thì là và ngò gai",
    price: 70000,
    imageUrl: "https://via.placeholder.com/400x256/6366F1/ffffff?text=Canh+Chua",
  }
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">
            🍜 Thực Đơn Món Ăn
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Khám phá hương vị đặc trưng của ẩm thực Việt Nam
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container-custom">
          <div className="flex flex-wrap gap-4 justify-center bg-white border border-neutral-200 rounded-full px-4 py-3 shadow-card">
            <button className="btn-primary">
              Tất Cả
            </button>
            <button className="btn-secondary">
              🍜 Món Nước
            </button>
            <button className="btn-secondary">
              🍚 Cơm/Cháo
            </button>
            <button className="btn-secondary">
              🥖 Bánh Mì
            </button>
            <button className="btn-secondary">
              🥗 Gỏi/Salad
            </button>
            <button className="btn-secondary">
              🔥 Món Nướng
            </button>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuData.map((item, index) => {
              const delayClass = index % 3 === 0 ? 'animate-fade-in-up' : 
                               index % 3 === 1 ? 'animate-fade-in-up-delay-1' : 
                               'animate-fade-in-up-delay-2';
              return (
                <div key={item.id} className={delayClass}>
                  <MenuItem item={item} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chef's Special */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
              👨‍🍳 Đặc Sản Của Bếp Trưởng
            </h2>
            <p className="text-lg text-neutral-600 animate-fade-in-up-delay-1">
              Những món ăn được chế biến theo công thức bí truyền
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in-left">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4">Bún Bò Huế Chính Gốc</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed">
                Được chế biến theo công thức truyền thống của xứ Huế, với nước dùng từ xương heo và bò ninh nhiều giờ, 
                kết hợp với chả cua, giò heo và huyết tươi. Món ăn mang đậm hương vị cung đình với màu đỏ đặc trưng 
                từ dầu điều.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary-600">85,000₫</span>
                <button className="btn-primary">
                  Đặt Món Ngay
                </button>
              </div>
            </div>
            <div className="animate-fade-in-right">
              <div className="card overflow-hidden">
                <Image
                  src="https://via.placeholder.com/600x320/DC2626/ffffff?text=B%C3%BAn+B%C3%B2+Hu%E1%BA%BF" 
                  alt="Bún Bò Huế"
                  width={600}
                  height={320}
                  className="w-full h-80 object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nutritional Info */}
      <section className="section-padding bg-neutral-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4 animate-fade-in-up">
              🌿 Cam Kết Chất Lượng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center animate-fade-in-up">
              <div className="p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">100% Tự Nhiên</h3>
                <p className="text-neutral-600">Không chất bảo quản, không phẩm màu tổng hợp</p>
              </div>
            </div>

            <div className="card text-center animate-fade-in-up-delay-1">
              <div className="p-6">
                <div className="w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Tươi Mỗi Ngày</h3>
                <p className="text-neutral-600">Nguyên liệu được nhập về và chế biến hàng ngày</p>
              </div>
            </div>

            <div className="card text-center animate-fade-in-up-delay-2">
              <div className="p-6">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Phục Vụ Nhanh</h3>
                <p className="text-neutral-600">Cam kết phục vụ trong vòng 15-20 phút</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
