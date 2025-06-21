import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface TokenState {
    token: string | null;
    setToken: (token: string | null) => void;
    clearToken: () => void;
}

const cookieStorage = {
    getItem: (name: string): string | null => {
        const value = Cookies.get(name);
        try {
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    },
    setItem: (name: string, value: string): void => {
        Cookies.set(name, value, {
            path: '/',
            expires: 1,
            sameSite: 'Lax',
            secure: false,
        });
    },
    removeItem: (name: string): void => {
        Cookies.remove(name, { path: '/' });
    },
};

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
                    const value = cookieStorage.getItem(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: (name, value) => cookieStorage.setItem(name, JSON.stringify(value)),
                removeItem: cookieStorage.removeItem,
            },
        }
    )
);