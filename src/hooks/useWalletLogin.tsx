"use client";

import { vinaswapApi } from '@/services/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useUserStore } from './useUserStore';
import { useEffect, useMemo } from 'react';
import { useTokenStore } from './useTokenStore';

export const useWalletLogin = () => {
    const { address } = useAccount();
    const { setUser, user } = useUserStore();
    const { setToken, token } = useTokenStore();
    const queryClient = useQueryClient();


    const nonceQuery = useQuery({
        queryKey: ["auth:nonce", address],
        enabled: !!address,
        queryFn: async () => {
            const res = await vinaswapApi.get(`/auth/nonce?address=${address}`);
            return res.data.nonce as string;
        },
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
    });

    const authStatusQuery = useQuery({
        queryKey: ["auth:status", address],
        enabled: !!address,
        queryFn: async () => {
            const res = await vinaswapApi.get(`/users/wallet/${address}`);
            if (res.data.user) {
                setUser(res.data.user as User);
                return { isLoggedIn: true, user: res.data.user };
            }
        },
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
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

            const res = await vinaswapApi.post('/auth/wallet-login', {
                address,
                nonce: nonceQuery.data,
                signature,
            });

            const data = res.data;


            return data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            setToken(data.token);
            vinaswapApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            queryClient.invalidateQueries({ queryKey: ["auth:status"] });
            console.log('Login successful:', data);
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });

    useEffect(() => {
        const shouldAttemptLogin = (
            address &&
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
        address,
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
    const isAuthenticated = !!user && !!address


    return {
        data: loginMutation.data,
        isLoading,
        isAuthenticated,
        error,
        nonce: nonceQuery.data,
    };
};