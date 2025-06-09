import { User } from '@/types/core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-store', // tên key trong sessionStorage
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