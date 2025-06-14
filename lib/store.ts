import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    warranty?: number;
    image?: string;
}

interface CartState {
    items: CartItem[];
    savedItems: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    updateWarranty: (id: number, warranty: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    saveForLater: (id: number) => void;
    moveToCart: (id: number) => void;
    removeSavedItem: (id: number) => void;
    getCartCount: () => number;
    getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            savedItems: [],
            addItem: (item) =>
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) => 
                                i.id === item.id 
                                    ? { ...i, quantity: i.quantity + (item.quantity || 1) } 
                                    : i
                            )
                        };
                    }
                    return {
                        items: [...state.items, { ...item, quantity: item.quantity || 1 }],
                    };
                }),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            clearCart: () => set({ items: [] }),
            updateWarranty: (id, warranty) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, warranty } : item
                    ),
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                })),
            saveForLater: (id) =>
                set((state) => {
                    const itemToSave = state.items.find((item) => item.id === id);
                    if (!itemToSave) return state;
                    return {
                        items: state.items.filter((item) => item.id !== id),
                        savedItems: [...state.savedItems, itemToSave],
                    };
                }),
            moveToCart: (id) =>
                set((state) => {
                    const itemToMove = state.savedItems.find((item) => item.id === id);
                    if (!itemToMove) return state;
                    const existingCartItem = state.items.find((item) => item.id === id);
                    return {
                        savedItems: state.savedItems.filter((item) => item.id !== id),
                        items: existingCartItem
                            ? state.items.map((item) => 
                                item.id === id 
                                    ? { ...item, quantity: item.quantity + itemToMove.quantity } 
                                    : item
                              )
                            : [...state.items, itemToMove],
                    };
                }),
            removeSavedItem: (id) =>
                set((state) => ({
                    savedItems: state.savedItems.filter((item) => item.id !== id),
                })),
            getCartCount: () => {
                const state = get();
                return state.items.reduce((total, item) => total + item.quantity, 0);
            },
            getCartTotal: () => {
                const state = get();
                return state.items.reduce((total, item) => {
                    const itemPrice = item.price * item.quantity;
                    return total + itemPrice;
                }, 0);
            },
        }),
        {
            name: "cart-storage",
        }
    )
);

export interface User {
    id: number;
    email: string;
    username: string;
    role: 'admin' | 'seller' | 'user';
    balance: number;
    banned: boolean;
    reg_date: number;
    ip_reg: string;
    ip_auth: string;
    user_agent: string;
    seller_name: string | null;
    seller_avatar: string | null;
    authorization: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSeller: boolean;
    setUser: (user: User | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setIsAdmin: (isAdmin: boolean) => void;
    setIsSeller: (isSeller: boolean) => void;
    hasSellerAccess: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isSeller: false,
            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    isAdmin: user?.role === 'admin',
                    isSeller: user?.role === 'seller' || user?.role === 'admin'
                });
            },
            setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setIsAdmin: (isAdmin) => set({ isAdmin }),
            setIsSeller: (isSeller) => set({ isSeller }),
            hasSellerAccess: () => {
                const state = get();
                return state.isSeller || state.isAdmin;
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);