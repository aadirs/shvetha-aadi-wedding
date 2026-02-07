import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

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
