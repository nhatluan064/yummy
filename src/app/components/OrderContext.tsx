"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export type CurrentOrderItem = {
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderContextType = {
  items: CurrentOrderItem[];
  addItem: (item: CurrentOrderItem) => void;
  removeItem: (name: string) => void;
  setQuantity: (name: string, quantity: number) => void;
  clear: () => void;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  tableNumber: string;
  setTableNumber: (v: string) => void;
  customerName?: string;
  setCustomerName: (v: string) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CurrentOrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");

  const addItem = (item: CurrentOrderItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.name === item.name);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          quantity: copy[idx].quantity + item.quantity,
        };
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((p) => p.name !== name));
  };

  const setQuantity = (name: string, quantity: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.name === name ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  const value: OrderContextType = {
    items,
    addItem,
    removeItem,
    setQuantity,
    clear,
    total,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((s) => !s),
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
