"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useAccountEffect, useSignMessage } from "wagmi";
import { useUserStore } from "./useUserStore";
import { useTokenStore } from "./useTokenStore";
import { useEffect, useRef } from "react";
import { vinaswapApi } from "@/services/axios";

export const useWalletLogin = () => {
    const queryClient = useQueryClient();
    const { address } = useAccount();
    const { setUser, user } = useUserStore();
    const { setToken, token } = useTokenStore();

    useQuery({
        queryKey: ["auth:nonce", address],
        queryFn: async () => {
            const res = await vinaswapApi.get(`/auth/nonce?address=${address}`);
            const nonce = res.data.nonce;

            await loginMutation.mutateAsync(nonce);

            return nonce;
        },
        enabled: !!address && !token && !user,
        staleTime: Infinity,
    });

    const { signMessageAsync, isPending: isSignPending, error: signError } = useSignMessage();

    const loginMutation = useMutation({
        mutationKey: ["auth:wallet-login", address],
        mutationFn: async (nonce: string) => {
            const signature = await signMessageAsync({ message: nonce });

            const res = await vinaswapApi.post("/auth/wallet-login", {
                address,
                nonce,
                signature,
            });

            return res.data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            setToken(data.token);
            vinaswapApi.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            queryClient.invalidateQueries({ queryKey: ["auth:status"] });
        },
        onError: (error) => {
            console.error("Login failed:", error);
        },
    });


    // Handle disconnect
    // useAccountEffect({
    //     onConnect: () => {
    //     },
    //     onDisconnect: () => {
    //         setUser(null);
    //         //   setToken(null);
    //         delete vinaswapApi.defaults.headers.common["Authorization"];
    //         queryClient.removeQueries({ queryKey: ["auth:nonce", address] });
    //     },
    // });


    const isLoading = loginMutation.isPending || isSignPending;
    const error = signError || loginMutation.error;
    const isAuthenticated = !!user && !!address;

    return {
        data: loginMutation.data,
        isLoading,
        isAuthenticated,
        error,
    };
};