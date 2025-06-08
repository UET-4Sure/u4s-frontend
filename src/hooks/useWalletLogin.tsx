"use client";

import { vinaswapApi } from '@/services/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useUserStore } from './useUserStore';
import { useEffect, useState } from 'react';

export const useWalletLogin = () => {
    const { address, isConnecting } = useAccount();
    const { setUser } = useUserStore();
    const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
    const [hasFetchedNonce, setHasFetchedNonce] = useState(false); // NEW FLAG

    const { data: nonce, isLoading: isNonceLoading, refetch: refetchNonce } = useQuery({
        queryKey: ["auth:get:nonce", address],
        enabled: !!address && !hasFetchedNonce,
        queryFn: async () => {
            const res = await vinaswapApi.get(`/auth/nonce?address=${address}`);
            setHasFetchedNonce(true); // FLAG IT AFTER FETCHED
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

    const { data, mutate: login, isPending: isLogining } = useMutation({
        mutationKey: ["auth:wallet-login", address, nonce],
        mutationFn: async () => {
            if (!nonce || !address) throw new Error('Missing nonce or address');

            const sig = await signMessageAsync({
                message: nonce,
            });

            const res = await vinaswapApi.post('/auth/wallet-login', {
                address,
                nonce,
                signature: sig,
            });

            const data = res.data;
            setUser(data.user);
            vinaswapApi.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
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
        if (address && nonce && !isLogining && !hasAttemptedLogin) {
            setHasAttemptedLogin(true);
            login();
        }
    }, [address, nonce, isLogining, hasAttemptedLogin]);

    const isLoading = isConnecting || isLogining || isNonceLoading || isPending;

    return {
        data,
        isLoading,
        isSuccess,
        error,
        signature,
    };
};