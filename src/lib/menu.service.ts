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
    const filters = [this.by('available', '==', true)];
    if (category) filters.push(this.by('category', '==', category));
    const items = await this.getAll(filters);
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const menuService = new MenuService();
