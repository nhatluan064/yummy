import { FirestoreService } from './firestore.service';
import type { MenuItem } from './types';

class MenuService extends FirestoreService<MenuItem> {
  constructor() {
    super('menu');
  }

  async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!item.name) throw new Error('Tên món là bắt buộc');
    if (!item.category) throw new Error('Thiếu loại món');
    if (typeof item.price !== 'number' || item.price <= 0) throw new Error('Giá không hợp lệ');
    if (typeof item.available !== 'boolean') item.available = true;
    return this.create(item);
  }

  async listAvailable(category?: string) {
    const filters = [this.by('available', '==', true), this.sortBy('name', 'asc')];
    if (category) filters.unshift(this.by('category', '==', category));
    return this.getAll(filters);
  }
}

export const menuService = new MenuService();
