import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();

const loadCart = () => {
  try {
    const saved = localStorage.getItem('wedding_cart');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('wedding_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((potId, potTitle, amountPaise, itemId, itemTitle) => {
    setItems(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      potId, potTitle, amountPaise, itemId: itemId || null, itemTitle: itemTitle || null
    }]);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPaise = items.reduce((sum, item) => sum + item.amountPaise, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalPaise, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
