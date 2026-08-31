import { useState, useMemo, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'cart_items';

export function useCart() {
  const [items, setItems] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          vendorId: product.vendorId._id,
          vendorName: product.vendorId.name,
          title: product.title,
          price: product.price,
          qty
        }
      ];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
  }, []);

  const groupedByVendor = useMemo(() => {
    const groups = {};
    for (const item of items) {
      if (!groups[item.vendorId]) {
        groups[item.vendorId] = { vendorId: item.vendorId, vendorName: item.vendorName, items: [], subtotal: 0 };
      }
      groups[item.vendorId].items.push(item);
      groups[item.vendorId].subtotal += item.price * item.qty;
    }
    return Object.values(groups);
  }, [items]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const clearCart = useCallback(() => setItems([]), []);

  return { items, groupedByVendor, total, addItem, removeItem, updateQty, clearCart };
}