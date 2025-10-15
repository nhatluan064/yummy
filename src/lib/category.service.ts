import { FirestoreService } from './firestore.service';
import type { Category } from './menuData';

class CategoryService extends FirestoreService<Category> {
  constructor() {
    super('categories');
  }

  async createWithId(id: string, data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return super.createWithId(id, data);
  }
}

export const categoryService = new CategoryService();
