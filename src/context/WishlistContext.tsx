import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  condition?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('pennitech_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pennitech_wishlist', JSON.stringify(items));
  }, [items]);

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        toast.success(`Removed ${item.name} from wishlist`);
        return prev.filter((i) => i.id !== item.id);
      } else {
        toast.success(`Added ${item.name} to wishlist`);
        return [...prev, item];
      }
    });
  };

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
