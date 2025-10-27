"use client";

import ReservationDrawer from "@/app/components/ReservationDrawer";
import ContactInfo from "@/app/components/ContactInfo";

export default function AdminReservationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Đặt Bàn
        </h1>

        {/* Contact Info */}
        <div className="mb-12">
          <ContactInfo />
        </div>

        {/* Reservation Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Thông tin đặt bàn
          </h2>
          <ReservationDrawer />
        </div>
      </div>
    </div>
  );
}