import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from './store';

export function useCartItems() {
  return useCartStore((state) => state.items);
}

export function useCartCount() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

export function useCartTotal() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

/** Har chaqirilganda yangi obyekt qaytarmasligi uchun `useShallow` bilan o'ralgan — aks holda cheksiz render tsikliga olib keladi. */
export function useCartActions() {
  return useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      removeItem: state.removeItem,
      setQuantity: state.setQuantity,
      clear: state.clear,
    })),
  );
}
