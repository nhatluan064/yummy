import {
  Category,
  MenuItem,
  updateCategories,
  updateMenuItems,
} from "./menuData";

export function seedSampleData() {
  const categories: Category[] = [
    { id: "mami", name: "Mì", icon: "🍜", order: 1 },
    { id: "com", name: "Cơm", icon: "🍚", order: 2 },
  ];

  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: "Phở Bò Đặc Biệt",
      category: "mami",
      categoryName: "Mì",
      price: 65000,
      description: "Nước dùng đậm đà, thịt bò tươi ngon",
      image: "https://via.placeholder.com/400x256/DC2626/ffffff?text=Ph%E1%BB%9F+B%C3%B2",
      available: true,
      popular: true,
      bestSeller: true,
      prepTime: "15-20 phút",
      rating: 4.7,
      reviewCount: 34,
      reviews: [],
    },
    {
      id: 2,
      name: "Bánh Mì Thịt Nướng",
      category: "mami",
      categoryName: "Mì",
      price: 35000,
      description: "Bánh mì giòn tan, thịt nướng thơm lừng",
      image: "https://via.placeholder.com/400x256/F59E0B/ffffff?text=B%C3%A1nh+M%C3%AC",
      available: true,
      popular: false,
      bestSeller: false,
      prepTime: "10-15 phút",
      rating: 4.3,
      reviewCount: 12,
      reviews: [],
    },
    {
      id: 3,
      name: "Cơm Tấm Sườn Nướng",
      category: "com",
      categoryName: "Cơm",
      price: 55000,
      description: "Sườn nướng mềm ngọt, cơm tấm dẻo thơm",
      image: "https://via.placeholder.com/400x256/10B981/ffffff?text=C%C6%A1m+T%E1%BA%A5m",
      available: true,
      popular: false,
      bestSeller: false,
      prepTime: "15-20 phút",
      rating: 4.5,
      reviewCount: 21,
      reviews: [],
    },
  ];

  updateCategories(categories);
  updateMenuItems(menuItems);
}

export default seedSampleData;
