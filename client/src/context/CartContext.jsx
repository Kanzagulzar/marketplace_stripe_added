import { createContext, useContext } from 'react';
import { useCart as useCartHook } from '../hooks/useCart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const cart = useCartHook();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}