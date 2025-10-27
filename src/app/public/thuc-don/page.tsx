"use client";

import { useEffect, useState } from "react";
import { getCategoriesFromFirestore, getMenuItemsFromFirestore } from "@/lib/firestoreMenu";
// NOTE: we intentionally don't import the full MenuItem/Category types here because
// Firestore returns a loose shape (id as string). We use local FS types instead.

// Firestore returns loose shapes (id as string). Use local lightweight types
type FSCat = { id: string; name?: string; icon?: string; order?: number };
type FSMenu = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  available?: boolean;
  category?: string;
};

export default function PublicMenuPage() {
  const [categories, setCategories] = useState<FSCat[]>([]);
  const [items, setItems] = useState<FSMenu[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      const cats = await getCategoriesFromFirestore();
      const menu = await getMenuItemsFromFirestore();
    setCategories((cats || []) as FSCat[]);
    // Only keep available items for public view
    setItems(((menu || []) as FSMenu[]).filter((m) => m.available));
    }
    fetchData();
  }, []);

  const filtered =
    selectedCategory === "all"
      ? items
      : items.filter((it) => it.category === selectedCategory);

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Thực Đơn (Chỉ xem)</h1>
          <p className="text-neutral-600">Phiên bản xem công khai, không có tuỳ chọn đặt hàng.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory("all")}
            className={selectedCategory === "all" ? "btn-primary" : "btn-secondary"}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? "btn-primary" : "btn-secondary"}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">Không có món nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((it) => (
              <div key={it.id} className="card overflow-hidden">
                <div className="relative h-56 w-full">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.name} className="w-full h-56 object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{it.name}</h3>
                  <p className="text-sm text-neutral-600 my-2 line-clamp-2">{it.description}</p>
                  <div className="flex items-center justify-end mt-4">
                    <div className="text-primary-600 font-bold">{(it.price || 0).toLocaleString("vi-VN")}₫</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
