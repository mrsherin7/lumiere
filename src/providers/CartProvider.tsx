'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem, CartState } from '@/types';
import { createClient } from '@/lib/supabase/client';

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  flyingItemRef: React.MutableRefObject<{ x: number; y: number; imageUrl: string } | null>;
  triggerFlyAnimation: (x: number, y: number, imageUrl: string) => void;
  isFlying: boolean;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return recalculate({ ...state, items: action.payload });

    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) =>
          i.product_id === action.payload.product_id &&
          i.variant_id === action.payload.variant_id
      );
      if (existing) {
        const updated = state.items.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, i.max_quantity) }
            : i
        );
        return recalculate({ ...state, items: updated });
      }
      const newItem: CartItem = { ...action.payload, id: uuidv4() };
      return recalculate({ ...state, items: [...state.items, newItem] });
    }

    case 'REMOVE_ITEM':
      return recalculate({
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      });

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return recalculate({
          ...state,
          items: state.items.filter((i) => i.id !== action.payload.id),
        });
      }
      const updated = state.items.map((i) =>
        i.id === action.payload.id
          ? { ...i, quantity: Math.min(action.payload.quantity, i.max_quantity) }
          : i
      );
      return recalculate({ ...state, items: updated });
    }

    case 'CLEAR_CART':
      return initialState;

    case 'SET_COUPON':
      return recalculate({
        ...state,
        couponCode: action.payload.code,
        couponDiscount: action.payload.discount,
      });

    case 'REMOVE_COUPON':
      return recalculate({ ...state, couponCode: null, couponDiscount: 0 });

    default:
      return state;
  }
}

function recalculate(state: CartState): CartState {
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = Math.max(0, subtotal - state.couponDiscount);
  return { ...state, subtotal, itemCount, total };
}

const initialState: CartState = {
  items: [],
  couponCode: null,
  couponDiscount: 0,
  subtotal: 0,
  total: 0,
  itemCount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const flyingItemRef = useRef<{ x: number; y: number; imageUrl: string } | null>(null);
  const supabase = createClient();

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lumiere-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CartItem[];
        dispatch({ type: 'HYDRATE', payload: parsed });
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('lumiere-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    const coupon = data;
    const now = new Date();

    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { success: false, message: 'This coupon is not yet active.' };
    }
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return { success: false, message: 'This coupon has expired.' };
    }
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { success: false, message: 'This coupon has reached its usage limit.' };
    }
    if (coupon.min_order_amount && state.subtotal < coupon.min_order_amount) {
      return {
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required.`,
      };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (state.subtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, state.subtotal);

    dispatch({ type: 'SET_COUPON', payload: { code: coupon.code, discount } });
    return { success: true, message: `Coupon applied! You save ₹${discount.toFixed(0)}.` };
  }, [supabase, state.subtotal]);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const triggerFlyAnimation = useCallback((x: number, y: number, imageUrl: string) => {
    flyingItemRef.current = { x, y, imageUrl };
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 900);
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        flyingItemRef,
        triggerFlyAnimation,
        isFlying,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
