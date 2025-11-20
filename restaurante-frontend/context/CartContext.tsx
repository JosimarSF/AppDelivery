import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, saveItem, deleteItem } from './storage';

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextData {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await getItem('cart');
        if (stored) setCart(JSON.parse(stored));
      } catch {
        await deleteItem('cart');
        setCart([]);
      }
    };
    loadCart();
  }, []);

  const persist = async (next: CartItem[]) => {
    setCart(next);
    await saveItem('cart', JSON.stringify(next));
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.id === item.id);
    const next = existing
      ? cart.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      : [...cart, { ...item, quantity: 1 }];
    persist(next);
  };

  const removeFromCart = (id: number) => {
    const next = cart.filter(i => i.id !== id);
    persist(next);
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const next = cart.map(i => (i.id === id ? { ...i, quantity } : i));
    persist(next);
  };

  const clearCart = async () => {
    setCart([]);
    await deleteItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
