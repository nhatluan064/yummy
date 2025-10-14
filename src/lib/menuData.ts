// Shared menu data between Admin and User
export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  popular: boolean;
  prepTime: string;
}

// Categories management
let categories: Category[] = [
  { id: 'mon-an', name: 'Món Ăn', icon: '🍜', order: 1 },
  { id: 'nuoc-uong', name: 'Nước Uống', icon: '🥤', order: 2 },
];

// This will be the single source of truth for menu items
// Admin can modify this data, User will read from it
let menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Phở Bò Đặc Biệt',
    category: 'mon-an',
    categoryName: 'Món Ăn',
    price: 85000,
    description: 'Nước dùng đậm đà từ xương bò ninh 24 tiếng, thịt bò tươi ngon tuyển chọn',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    available: true,
    popular: true,
    prepTime: '15-20 phút',
  },
  {
    id: 2,
    name: 'Cơm Tấm Sườn Bì Chả',
    category: 'mon-an',
    categoryName: 'Món Ăn',
    price: 65000,
    description: 'Sườn cốt lết nướng mềm ngọt, bì dai giòn, chả trứng hấp thơm',
    image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400',
    available: true,
    popular: true,
    prepTime: '10-15 phút',
  },
  {
    id: 3,
    name: 'Bún Chả Hà Nội',
    category: 'mon-an',
    categoryName: 'Món Ăn',
    price: 70000,
    description: 'Chả nướng thơm lừng trên than hoa, nước mắm chua ngọt đậm đà',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
    available: true,
    popular: false,
    prepTime: '15-20 phút',
  },
  {
    id: 4,
    name: 'Mỳ Cay Hàn Quốc',
    category: 'mon-an',
    categoryName: 'Món Ăn',
    price: 75000,
    description: 'Mỳ cay Hàn Quốc với độ cay tùy chỉnh theo sở thích',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
    available: false,
    popular: true,
    prepTime: '10-15 phút',
  },
  {
    id: 5,
    name: 'Bánh Mì Heo Quay',
    category: 'mon-an',
    categoryName: 'Món Ăn',
    price: 30000,
    description: 'Da giòn rụm, thịt mềm ngọt, kết hợp với đồ chua thanh mát',
    image: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400',
    available: true,
    popular: true,
    prepTime: '5-10 phút',
  },
  {
    id: 6,
    name: 'Gỏi Cuốn Tôm Thịt',
    category: 'mon-an',
    categoryName: 'Món Ăn',
    price: 35000,
    description: 'Bánh tráng mỏng trong suốt, tôm tươi, thịt luộc và rau sống',
    image: 'https://images.unsplash.com/photo-1559843245-7da7336a4e0f?w=400',
    available: true,
    popular: false,
    prepTime: '10 phút',
  },
  {
    id: 7,
    name: 'Cà Phê Sữa Đá',
    category: 'nuoc-uong',
    categoryName: 'Nước Uống',
    price: 25000,
    description: 'Cà phê sữa đá truyền thống Việt Nam, đậm đà thơm ngon',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
    available: true,
    popular: true,
    prepTime: '5 phút',
  },
  {
    id: 8,
    name: 'Trà Đá',
    category: 'nuoc-uong',
    categoryName: 'Nước Uống',
    price: 10000,
    description: 'Trà đá miễn phí khi gọi món ăn',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    available: true,
    popular: false,
    prepTime: '2 phút',
  },
  {
    id: 9,
    name: 'Sinh Tố Bơ',
    category: 'nuoc-uong',
    categoryName: 'Nước Uống',
    price: 35000,
    description: 'Sinh tố bơ béo ngậy với sữa đặc thơm ngon',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400',
    available: true,
    popular: true,
    prepTime: '5 phút',
  },
  {
    id: 10,
    name: 'Nước Chanh Tươi',
    category: 'nuoc-uong',
    categoryName: 'Nước Uống',
    price: 20000,
    description: 'Nước chanh tươi mát lạnh, giải nhiệt mùa hè',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400',
    available: true,
    popular: false,
    prepTime: '3 phút',
  },
];

// Get all menu items
export function getMenuItems(): MenuItem[] {
  return [...menuItems];
}

// Get menu items by category
export function getMenuItemsByCategory(category: string): MenuItem[] {
  if (category === 'all') return getMenuItems();
  return menuItems.filter(item => item.category === category);
}

// Get only available menu items (for User)
export function getAvailableMenuItems(): MenuItem[] {
  return menuItems.filter(item => item.available);
}

// Get available menu items by category (for User)
export function getAvailableMenuItemsByCategory(category: string): MenuItem[] {
  if (category === 'all') return getAvailableMenuItems();
  return menuItems.filter(item => item.category === category && item.available);
}

// Update menu items (for Admin)
export function updateMenuItems(newItems: MenuItem[]): void {
  menuItems = newItems;
}

// Get menu item by ID
export function getMenuItemById(id: number): MenuItem | undefined {
  return menuItems.find(item => item.id === id);
}

// Category management functions
export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function addCategory(category: Category): void {
  categories.push(category);
}

export function updateCategory(id: string, updatedCategory: Partial<Category>): void {
  const index = categories.findIndex(cat => cat.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updatedCategory };
  }
}

export function deleteCategory(id: string): void {
  // Remove category
  categories = categories.filter(cat => cat.id !== id);
  // Remove all menu items in this category
  menuItems = menuItems.filter(item => item.category !== id);
}

export function updateCategories(newCategories: Category[]): void {
  categories = newCategories;
}
