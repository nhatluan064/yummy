"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useToastSystem } from "@/app/components/ToastSystem";
import { imageStorageService, type ImageMetadata } from "@/lib/imageStorage.service";
import { settingsService, type RestaurantSettings } from "@/lib/settings.service";

export default function SettingsPage() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [copyingUrl, setCopyingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastSystem();

  // Load images and settings
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [imagesData, settingsData] = await Promise.all([
        imageStorageService.getAllImages(),
        settingsService.getSettings(),
      ]);
      setImages(imagesData || []);
      setSettings(settingsData || {});
      
      // Log for debugging but don't show error toast
      console.log('Loaded images:', imagesData?.length || 0);
      console.log('Loaded settings:', settingsData);
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty defaults instead of showing error
      setImages([]);
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = imageStorageService.validateImage(file);
    if (!validation.valid) {
      addToast("error", "Lỗi", validation.error || "File không hợp lệ", 3000);
      return;
    }

    try {
      setUploading(true);

      // Get admin user info
      const adminUserStr = localStorage.getItem("adminUser");
      const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

      // Upload image
      const uploadedImage = await imageStorageService.uploadImage(
        file,
        adminUser?.email || "admin"
      );

      // Add to images list
      setImages([uploadedImage, ...images]);

      addToast(
        "success",
        "Thành công",
        "Đã tải ảnh lên thành công!",
        3000
      );

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      addToast("error", "Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.", 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image: ImageMetadata) => {
    if (!confirm(`Bạn có chắc muốn xóa ảnh "${image.name}"?`)) return;

    try {
      await imageStorageService.deleteImage(image.id, image.path);
      setImages(images.filter((img) => img.id !== image.id));
      addToast("success", "Thành công", "Đã xóa ảnh thành công!", 2000);
      
      // Close modal if this image is selected
      if (selectedImage?.id === image.id) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      addToast("error", "Lỗi", "Không thể xóa ảnh. Vui lòng thử lại.", 3000);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyingUrl(url);
      addToast("success", "Đã sao chép", "URL đã được sao chép vào clipboard!", 2000);
      setTimeout(() => setCopyingUrl(null), 2000);
    } catch (error) {
      addToast("error", "Lỗi", "Không thể sao chép URL", 2000);
    }
  };

  const setAsLogo = async (imageUrl: string) => {
    try {
      await settingsService.updateLogo(imageUrl);
      setSettings({ ...settings, logo: imageUrl });
      addToast("success", "Thành công", "Đã cập nhật logo!", 2000);
    } catch (error) {
      addToast("error", "Lỗi", "Không thể cập nhật logo", 2000);
    }
  };

  const setAsBanner = async (imageUrl: string) => {
    try {
      await settingsService.updateBanner(imageUrl);
      setSettings({ ...settings, banner: imageUrl });
      addToast("success", "Thành công", "Đã cập nhật banner!", 2000);
    } catch (error) {
      addToast("error", "Lỗi", "Không thể cập nhật banner", 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">
          Cài Đặt & Quản Lý Ảnh
        </h1>
        <p className="text-neutral-600">
          Upload và quản lý ảnh cho logo, banner và các phần khác của website
        </p>
      </div>

      {/* Current Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">
          Hình Ảnh Hiện Tại
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <h3 className="font-semibold text-neutral-700 mb-2">Logo Quán</h3>
            {settings.logo ? (
              <div className="relative w-32 h-32 border-2 border-neutral-200 rounded-lg overflow-hidden">
                <Image
                  src={settings.logo}
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Banner */}
          <div>
            <h3 className="font-semibold text-neutral-700 mb-2">Banner Quán</h3>
            {settings.banner ? (
              <div className="relative w-full h-32 border-2 border-neutral-200 rounded-lg overflow-hidden">
                <Image
                  src={settings.banner}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">
          Upload Ảnh Mới
        </h2>
        
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-neutral-600">Đang tải lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary mb-2"
              >
                Chọn Ảnh
              </button>
              <p className="text-sm text-neutral-500">
                JPG, PNG, GIF, WEBP (Tối đa 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">
          Thư Viện Ảnh ({images.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-neutral-500">Chưa có ảnh nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-neutral-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-neutral-800 truncate flex-1">
                {selectedImage.name}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="ml-4 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Image Preview */}
              <div className="relative w-full aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Image Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Kích thước:</span>
                  <span className="ml-2 font-semibold">
                    {imageStorageService.formatFileSize(selectedImage.size)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Loại:</span>
                  <span className="ml-2 font-semibold">{selectedImage.type}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Ngày tải:</span>
                  <span className="ml-2 font-semibold">
                    {selectedImage.uploadedAt.toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600">Người tải:</span>
                  <span className="ml-2 font-semibold">
                    {selectedImage.uploadedBy || "N/A"}
                  </span>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="text-sm text-neutral-600 mb-1 block">URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedImage.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedImage.url)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    {copyingUrl === selectedImage.url ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Đã sao
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setAsLogo(selectedImage.url)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Đặt làm Logo
                </button>
                <button
                  onClick={() => setAsBanner(selectedImage.url)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Đặt làm Banner
                </button>
                <button
                  onClick={() => handleDeleteImage(selectedImage)}
                  className="btn-danger flex items-center gap-2 ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa Ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
