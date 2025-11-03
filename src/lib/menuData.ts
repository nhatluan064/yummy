// DEPRECATED: This file is kept for compatibility only
// Use @/lib/types and services instead

import type { MenuItem as MenuItemType } from './types';

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  hidden?: boolean;
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
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

let categories: Category[] = [];
let menuItems: MenuItem[] = [];

// Stub functions for compatibility
export function getMenuItems(): MenuItem[] {
  console.warn('getMenuItems is deprecated. Use menuService.getAll() instead');
  return [...menuItems];
}

// Get menu items by category
export function getMenuItemsByCategory(category: string): MenuItem[] {
  if (category === "all") return getMenuItems();
  return menuItems.filter((item) => item.category === category);
}

// Get only available menu items (for User)
export function getAvailableMenuItems(): MenuItem[] {
  return menuItems.filter((item) => item.available);
}

// Get available menu items by category (for User)
export function getAvailableMenuItemsByCategory(category: string): MenuItem[] {
  if (category === "all") return getAvailableMenuItems();
  return menuItems.filter(
    (item) => item.category === category && item.available
  );
}

// Update menu items (for Admin)
export function updateMenuItems(newItems: MenuItem[]): void {
  menuItems = newItems;
}

// Get menu item by ID
export function getMenuItemById(id: number): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}

// Category management functions
export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function addCategory(category: Category): void {
  categories.push(category);
}

export function updateCategory(
  id: string,
  updatedCategory: Partial<Category>
): void {
  const index = categories.findIndex((cat) => cat.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updatedCategory };
  }
}

export function deleteCategory(id: string): void {
  // Remove category
  categories = categories.filter((cat) => cat.id !== id);
  // Remove all menu items in this category
  menuItems = menuItems.filter((item) => item.category !== id);
}

export function updateCategories(newCategories: Category[]): void {
  categories = newCategories;
}

// Utility functions for data management
export function resetToDefaults(): void {
  categories = [];
  menuItems = [];
}

export function exportData(): string {
  return JSON.stringify(
    {
      categories,
      menuItems,
      exportDate: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    if (data.categories && data.menuItems) {
      categories = data.categories;
      menuItems = data.menuItems;
      return true;
    }
    return false;
  } catch (e) {
    console.error("Failed to import data:", e);
    return false;
  }
}
