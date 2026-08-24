'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('crown-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // ignore corrupted cart data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Skip writes until the cart has been loaded from storage — otherwise
    // this effect fires on mount with the initial empty array and wipes out
    // whatever was saved before the load effect above gets a chance to apply it.
    if (!hydrated) return;
    localStorage.setItem('crown-cart', JSON.stringify(items));
  }, [items, hydrated]);

  const addToCart = (product, size = '', quantity = 1) => {
    setItems(prev => {
      const key = `${product.slug}-${size}`;
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        key,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '/images/products/logo.jpg',
        size,
        quantity
      }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (key) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) return removeFromCart(key);
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
