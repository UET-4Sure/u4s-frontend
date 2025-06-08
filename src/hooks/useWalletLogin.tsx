"use client";

import { vinaswapApi } from '@/services/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useUserStore } from './useUserStore';
import { useEffect, useMemo } from 'react';

export const useWalletLogin = () => {
    const { address, isConnected } = useAccount();
    const { setUser } = useUserStore();
    const queryClient = useQueryClient();

    const isLoginReady = useMemo(() =>
        !!address && isConnected,
        [address, isConnected]
    );

    const nonceQuery = useQuery({
        queryKey: ["auth:nonce", address],
        enabled: isLoginReady,
        queryFn: async () => {
            const res = await vinaswapApi.get(`/auth/nonce?address=${address}`);
            return res.data.nonce as string;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const authStatusQuery = useQuery({
        queryKey: ["auth:status", address],
        enabled: isLoginReady,
        queryFn: async () => {
            try {
                const res = await vinaswapApi.get(`/users/wallet/${address}`);
                if (res.data.user) {
                    setUser(res.data.user as User);
                    return { isLoggedIn: true, user: res.data.user };
                }
                return { isLoggedIn: false, user: null };
            } catch {
                return { isLoggedIn: false, user: null };
            }
        },
        staleTime: 2 * 60 * 1000,
        retry: false,
    });

    const { signMessageAsync, isPending: isSignPending, error: signError } = useSignMessage();

    const loginMutation = useMutation({
        mutationKey: ["auth:wallet-login", address],
        mutationFn: async () => {
            if (!nonceQuery.data || !address) {
                throw new Error('Missing nonce or address');
            }

            const signature = await signMessageAsync({
                message: nonceQuery.data
            });

            const res = await vinaswapApi.post('/auth/users/wallet-login', {
                address,
                nonce: nonceQuery.data,
                signature,
            });

            const data = res.data;
            setUser(data.user);
            vinaswapApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            // Invalidate auth status to refresh
            queryClient.invalidateQueries({ queryKey: ["auth:status"] });

            return data;
        },
        onSuccess: (data) => {
            console.log('Login successful:', data);
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });

    useEffect(() => {
        const shouldAttemptLogin = (
            isLoginReady &&
            nonceQuery.isSuccess &&
            nonceQuery.data &&
            authStatusQuery.isSuccess &&
            !authStatusQuery.data?.isLoggedIn &&
            !loginMutation.isPending &&
            !loginMutation.isSuccess &&
            !loginMutation.isError
        );

        if (shouldAttemptLogin) {
            loginMutation.mutate();
        }
    }, [
        isLoginReady,
        nonceQuery.isSuccess,
        nonceQuery.data,
        authStatusQuery.isSuccess,
        authStatusQuery.data?.isLoggedIn,
        loginMutation.isPending,
        loginMutation.isSuccess,
        loginMutation.isError,
    ]);

    // Cleanup when address changes
    useEffect(() => {
        return () => {
            loginMutation.reset();
        };
    }, [address]);

    const isLoading = (
        nonceQuery.isLoading ||
        authStatusQuery.isLoading ||
        loginMutation.isPending ||
        isSignPending
    );

    const error = signError || loginMutation.error;
    const isSuccess = loginMutation.isSuccess || authStatusQuery.data?.isLoggedIn;

    return {
        data: loginMutation.data,
        isLoading,
        isSuccess,
        error,
        nonce: nonceQuery.data,
        // Additional states for debugging
        isLoginReady,
        isNonceLoaded: nonceQuery.isSuccess,
        isAuthChecked: authStatusQuery.isSuccess,
        isAlreadyLoggedIn: authStatusQuery.data?.isLoggedIn,
    };
};