import { FirestoreService } from './firestore.service';
import type { Feedback } from './types';

class FeedbackService extends FirestoreService<Feedback> {
  constructor() {
    super('feedback');
  }

  async createFeedback(data: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!data.customerName) throw new Error('Thiếu tên khách hàng');
    if (!data.comment) throw new Error('Thiếu nội dung đánh giá');
    if (data.rating < 1 || data.rating > 5) throw new Error('Rating phải từ 1 đến 5');
    return this.create(data);
  }
}

export const feedbackService = new FeedbackService();
