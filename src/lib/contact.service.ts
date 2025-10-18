import { FirestoreService } from "./firestore.service";
import type { Contact } from "./types";

class ContactService extends FirestoreService<Contact> {
  constructor() {
    super("contacts");
  }

  async createContact(
    data: Omit<Contact, "id" | "createdAt" | "updatedAt" | "status">
  ) {
    if (!data.name) throw new Error("Thiếu tên khách hàng");
    if (!data.email) throw new Error("Thiếu email");
    if (!data.phone) throw new Error("Thiếu số điện thoại");
    if (!data.subject) throw new Error("Thiếu chủ đề");
    if (!data.message) throw new Error("Thiếu nội dung tin nhắn");
    return this.create({ ...data, status: "pending" });
  }

  async updateStatus(id: string, status: Contact["status"]) {
    return this.update(id, { status });
  }

  subscribeToContacts(callback: (contacts: Contact[]) => void) {
    return this.subscribeAll([this.sortBy("createdAt", "desc")], callback);
  }
}

export const contactService = new ContactService();
