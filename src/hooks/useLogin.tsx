"use client";

import { vinaswapApi } from '@/services/axios';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';

export const useWalletLogin = () => {
    const { address, isConnected } = useAccount();


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

    
    const login = async () => {
        if (!nonce || !address) throw new Error('Missing nonce or address');

        const sig = await signMessageAsync({
            message: nonce,
        });

        const res = await vinaswapApi.post('/auth/wallet-login', {
            address,
            signature: sig,
        });

        return res.data;
    };

    return {
        login,
        isPending,
        isSuccess,
        error,
        signature,
    };
};