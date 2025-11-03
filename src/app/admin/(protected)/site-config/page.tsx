"use client";

import { useState, useEffect } from "react";
import { siteConfigService } from "@/lib/siteConfig.service";
import type { SiteConfig } from "@/lib/types";

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load config
    const loadConfig = async () => {
      const data = await siteConfigService.getConfig();
      if (data) {
        setConfig(data);
      } else {
        // Initialize with defaults
        await siteConfigService.initializeDefaultConfig();
        const newData = await siteConfigService.getConfig();
        setConfig(newData);
      }
      setLoading(false);
    };

    loadConfig();

    // Subscribe to changes
    const unsubscribe = siteConfigService.subscribeToConfig((data) => {
      if (data) setConfig(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      await siteConfigService.updateConfig(config);
      alert("✓ Đã lưu cấu hình thành công!");
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("Lỗi khi lưu cấu hình. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            ⚙️ Quản lý Cấu hình Website
          </h1>
          <p className="text-neutral-600 mt-1">
            Thay đổi thông tin tại đây sẽ cập nhật toàn bộ website
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-3 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding Section */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span>🎨</span> Thương hiệu
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tên Website
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Mì cay yummy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Icon/Emoji
              </label>
              <input
                type="text"
                value={config.siteIcon}
                onChange={(e) => setConfig({ ...config, siteIcon: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-3xl"
                placeholder="🍜"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Slogan / Mô tả
              </label>
              <textarea
                value={config.tagline || ""}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Thưởng thức tô mì cay chuẩn vị Hàn Quốc..."
              />
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span>📞</span> Thông tin Liên hệ
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0988 994 799"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email (tùy chọn)
              </label>
              <input
                type="email"
                value={config.email || ""}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={config.facebook || ""}
                onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Tên trang hoặc link Facebook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Zalo
              </label>
              <input
                type="text"
                value={config.zalo || ""}
                onChange={(e) => setConfig({ ...config, zalo: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Số Zalo"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span>📍</span> Địa chỉ
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Địa chỉ chính
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="588/6 Cách Mạng Tháng 8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phường/Quận/Thành phố
              </label>
              <input
                type="text"
                value={config.addressDetail}
                onChange={(e) => setConfig({ ...config, addressDetail: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Phường Bà Rịa, TP.HCM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Quốc gia
              </label>
              <input
                type="text"
                value={config.country}
                onChange={(e) => setConfig({ ...config, country: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Việt Nam"
              />
            </div>
          </div>
        </div>

        {/* Opening Hours Section */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span>🕐</span> Giờ hoạt động
          </h2>
          <div className="space-y-3">
            {Object.entries(config.openingHours).map(([day, hours]) => {
              const dayLabels: Record<string, string> = {
                monday: "Thứ 2",
                tuesday: "Thứ 3",
                wednesday: "Thứ 4",
                thursday: "Thứ 5",
                friday: "Thứ 6",
                saturday: "Thứ 7",
                sunday: "Chủ nhật",
              };

              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-700 w-20">
                    {dayLabels[day]}
                  </span>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        openingHours: {
                          ...config.openingHours,
                          [day]: { ...hours, open: e.target.value },
                        },
                      })
                    }
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    disabled={hours.closed}
                  />
                  <span className="text-neutral-500">-</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        openingHours: {
                          ...config.openingHours,
                          [day]: { ...hours, close: e.target.value },
                        },
                      })
                    }
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    disabled={hours.closed}
                  />
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={hours.closed || false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          openingHours: {
                            ...config.openingHours,
                            [day]: { ...hours, closed: e.target.checked },
                          },
                        })
                      }
                      className="rounded border-neutral-300"
                    />
                    <span className="text-neutral-600">Đóng cửa</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Copyright Section */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span>©</span> Bản quyền
          </h2>
          <input
            type="text"
            value={config.copyrightText || ""}
            onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="© 2025 Mì cay yummy. Tất cả quyền được bảo lưu."
          />
        </div>
      </div>

      {/* Save Button (Mobile) */}
      <div className="flex justify-end lg:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-3 disabled:opacity-50 w-full"
        >
          {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
