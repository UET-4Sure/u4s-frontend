import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenState {
    token: string | null;
    setToken: (token: string | null) => void;
    clearToken: () => void;
}

export const useTokenStore = create<TokenState>()(
    persist(
        (set) => ({
            token: null,
            setToken: (token) => set({ token }),
            clearToken: () => set({ token: null }),
        }),
        {
            name: 'token-storage',
            storage: {
                getItem: (name) => {
                    const value = sessionStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
                removeItem: (name) => sessionStorage.removeItem(name),
            },
        }
    )
);