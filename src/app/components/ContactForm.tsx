"use client";
import { useState } from "react";
import { useToast } from "@/app/components/Toast";
import { contactService } from "@/lib/contact.service";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subjectLabels: { [key: string]: string } = {
        booking: "Đặt Bàn",
        menu: "Thực Đơn",
        event: "Tổ Chức Sự Kiện",
        feedback: "Góp Ý / Phản Hồi",
        other: "Khác",
      };

      const contactData = {
        ...formData,
        subjectLabel: subjectLabels[formData.subject] || formData.subject,
      };

      await contactService.createContact(contactData);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.showToast(
        "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
        3000,
        "success"
      );
    } catch (err) {
      toast.showToast(
        "Gửi liên hệ thất bại: " + (err instanceof Error ? err.message : "Lỗi không xác định"),
        3500,
        "error"
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-neutral-50">
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">📞 Liên Hệ Với Chúng Tôi</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">Chúng tôi luôn sẵn sàng lắng nghe và phục vụ bạn</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">Gửi Tin Nhắn</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-neutral-700 font-medium mb-2">Họ và Tên *</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-neutral-700 font-medium mb-2">Email *</label>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-neutral-700 font-medium mb-2">Số Điện Thoại *</label>
                      <input id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+84 123 456 789" className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-neutral-700 font-medium mb-2">Chủ Đề *</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white">
                      <option value="">Chọn chủ đề</option>
                      <option value="booking">Đặt Bàn</option>
                      <option value="menu">Thực Đơn</option>
                      <option value="event">Tổ Chức Sự Kiện</option>
                      <option value="feedback">Góp Ý / Phản Hồi</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-neutral-700 font-medium mb-2">Nội Dung *</label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={6} required placeholder="Nhập nội dung tin nhắn của bạn..." className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white" />
                  </div>

                  <button type="submit" className="btn-accent w-full text-lg py-4">Gửi Tin Nhắn</button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">Thông Tin Liên Hệ</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#8B7CF6] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Địa Chỉ</h3>
                      <p className="text-neutral-600">588/6 Hà Huy Tập, Phường Bà Rịa, HCM</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#8B7CF6] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="white" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-800 mb-1">Hotline</h3>
                      <a href="tel:0988994799" className="text-[#8B7CF6] hover:underline">0988 994 799</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Bản Đồ</h3>
                <div className="bg-neutral-200 rounded-lg overflow-hidden h-[300px]"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1961.5665524607439!2d107.18502083281068!3d10.490171921049502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175735a9fca1ce1%3A0xd20f7248807643ad!2zNTg4IEjDoCBIdXkgVOG6rXAsIFBoxrDhu5tjIFRydW5nLCBCw6AgUuG7i2EsIELDoCBS4buLYSAtIFbFqW5nIFTDoHUsIFZpZXRuYW0!5e0!3m2!1sen!2sus!4v1760583213893!5m2!1sen!2sus" width="100%" height="100%" className="border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Restaurant Location"></iframe></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
