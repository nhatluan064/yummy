"use client";

import { useState, useEffect } from "react";
import { type Contact } from "@/lib/types";

export default function ContactManagementPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "responded" | "closed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load all contacts from Firestore with realtime updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      const { contactService } = await import("@/lib/contact.service");
      unsubscribe = contactService.subscribeToContacts((contacts) => {
        setAllContacts(contacts);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update contact status
  const updateStatus = async (
    contactId: string,
    newStatus: Contact["status"]
  ) => {
    const { contactService } = await import("@/lib/contact.service");
    await contactService.updateStatus(contactId, newStatus);
    // No need to manually reload as subscription will handle it
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm("Bạn có chắc muốn xóa liên hệ này?")) return;
    const { contactService } = await import("@/lib/contact.service");
    await contactService.delete(contactId);
    // No need to manually reload as subscription will handle it
  };

  // Filter contacts
  const filteredContacts = allContacts.filter((contact) => {
    // Filter by status
    if (filterStatus !== "all" && contact.status !== filterStatus) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.subject.toLowerCase().includes(query) ||
        contact.message.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "responded":
        return "bg-blue-100 text-blue-700";
      case "closed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: Contact["status"]) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "responded":
        return "Đã phản hồi";
      case "closed":
        return "Đã đóng";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            📞 Quản Lý Liên Hệ
          </h1>
          <p className="text-neutral-600 mt-2">
            Xem và quản lý các tin nhắn liên hệ từ khách hàng
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-neutral-200">
          <svg
            className="w-5 h-5 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-2xl font-bold text-primary-600">
            {allContacts.length}
          </span>
          <span className="text-sm text-neutral-600">Tổng liên hệ</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Chờ xử lý</p>
              <p className="text-3xl font-bold text-yellow-600">
                {allContacts.filter((c) => c.status === "pending").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Đã phản hồi</p>
              <p className="text-3xl font-bold text-blue-600">
                {allContacts.filter((c) => c.status === "responded").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Đã đóng</p>
              <p className="text-3xl font-bold text-green-600">
                {allContacts.filter((c) => c.status === "closed").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Tổng số</p>
              <p className="text-3xl font-bold text-purple-600">
                {allContacts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, email, chủ đề, nội dung..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Chờ xử lý
            </button>
            <button
              onClick={() => setFilterStatus("responded")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "responded"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Đã phản hồi
            </button>
            <button
              onClick={() => setFilterStatus("closed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "closed"
                  ? "bg-green-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Đã đóng
            </button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <div className="card p-12 text-center">
            <svg
              className="w-16 h-16 text-neutral-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-neutral-500 text-lg">Chưa có liên hệ nào</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="card p-4 md:p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex flex-row md:flex-row items-start gap-3 flex-1 w-full">
                  {/* Avatar */}
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold text-base md:text-lg">
                      {contact.name
                        ? contact.name.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1 md:mb-2 w-full">
                      <h3 className="font-bold text-neutral-800 text-base md:text-lg truncate break-words">
                        {contact.name}
                      </h3>
                      <div className="flex flex-row items-center gap-2 mt-1 md:mt-0">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(
                            contact.status
                          )}`}
                        >
                          {getStatusText(contact.status)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {contact.createdAt?.toDate()?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 md:gap-2">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-xs md:text-sm text-neutral-600 break-words">
                        <span className="truncate">
                          <span className="hidden md:inline">📧 </span>
                          {contact.email}
                        </span>
                        <span className="truncate">
                          <span className="hidden md:inline">📱 </span>
                          {contact.phone}
                        </span>
                      </div>
                      <div className="flex flex-row items-center gap-2 flex-wrap">
                        <span className="text-xs md:text-sm font-medium text-neutral-600">
                          Chủ đề:
                        </span>
                        <span className="text-xs md:text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {contact.subjectLabel || contact.subject}
                        </span>
                      </div>
                      <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-2 md:p-3 rounded-lg text-xs md:text-sm break-words">
                        {contact.message}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-row items-center gap-2 mt-2 md:mt-0 ml-0 md:ml-4">
                  <select
                    value={contact.status}
                    onChange={(e) =>
                      contact.id &&
                      updateStatus(
                        contact.id,
                        e.target.value as Contact["status"]
                      )
                    }
                    className="px-2 py-1 border border-neutral-300 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="responded">Đã phản hồi</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                  <button
                    onClick={() => contact.id && deleteContact(contact.id)}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                    title="Xóa liên hệ"
                  >
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
