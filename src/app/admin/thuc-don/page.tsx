"use client";

import { getCategories, getAvailableMenuItems, MenuItem } from "@/lib/menuData";
import Image from "next/image";

export default function AdminMenuPage() {
  const categories = getCategories();
  const menuItems = getAvailableMenuItems();

  const groupedItems: { [key: string]: MenuItem[] } = {};
  categories.forEach(cat => {
    groupedItems[cat.id] = menuItems.filter(item => item.category === cat.id);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Thực Đơn
      </h1>

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.id} className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedItems[category.id].map((item: MenuItem) => (
                <article
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <span className="text-primary-600 font-bold">
                        {item.price.toLocaleString()}đ
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.description}
                    </p>
                    {item.bestSeller && (
                      <span className="inline-block bg-accent-100 text-accent-800 text-xs px-2 py-1 rounded">
                        Bán chạy
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}