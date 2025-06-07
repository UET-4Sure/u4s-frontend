"use client";

import { vinaswapApi } from '@/services/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useUserStore } from './useUserStore';

export const useWalletLogin = () => {
    const { address, isConnecting } = useAccount();
    const { setUser } = useUserStore();

    const { data: nonce, isLoading: isNonceLoading } = useQuery({
        queryKey: ["auth:get:nonce", address],
        enabled: !!address,
        queryFn: async () => {
            const res = await vinaswapApi.get(`/auth/nonce?address=${address}`);
            return res.data.nonce as string;
        },
    });

    const {
        data: signature,
        signMessageAsync,
        isPending,
        isSuccess,
        error,
    } = useSignMessage();


    const { mutate: login, isPending: isLogining } = useMutation({
        mutationKey: ["auth:wallet-login", address, nonce],
        mutationFn: async () => {
            if (!nonce || !address) throw new Error('Missing nonce or address');

            const sig = await signMessageAsync({
                message: nonce,
            });

            const res = await vinaswapApi.post('/auth/wallet-login', {
                address,
                signature: sig,
            });

            return res.data as AuthLoginResponse;
        },
        onSuccess: (data) => {
            setUser(data.user);
            vinaswapApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        },
        onError: (error) => {
            console.error("Login failed:", error);
        },
    });

    const isLoading = isConnecting || isLogining || isNonceLoading || isPending;

    return {
        login,
        isLoading,
        isSuccess,
        error,
        signature,
    };
};