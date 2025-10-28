"use client";

import ContactInfo from "@/app/components/ContactInfo";
import ContactForm from "@/app/components/ContactForm";

export default function AdminContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Liên Hệ & Phản Hồi
        </h1>
        
        {/* Contact Information */}
        <div className="mb-12">
          <ContactInfo />
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi phản hồi</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
