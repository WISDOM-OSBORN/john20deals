import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  condition?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'john20_cart';
const LEGACY_CART_KEY = 'pennitech_cart';

function loadCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_CART_KEY);
  if (!raw) return [];
  if (!localStorage.getItem(CART_KEY) && localStorage.getItem(LEGACY_CART_KEY)) {
    localStorage.setItem(CART_KEY, raw);
    localStorage.removeItem(LEGACY_CART_KEY);
  }
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });

    // Determine if it was an update or a new item for the toast
    const isExisting = items.some(item => item.id === newItem.id);
    setTimeout(() => {
      if (isExisting) {
        toast.success(`Updated quantity for ${newItem.name}`);
      } else {
        toast.success(`Added ${newItem.name} to cart`);
      }
    }, 0);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTimeout(() => {
      toast.success('Item removed from cart');
    }, 0);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
