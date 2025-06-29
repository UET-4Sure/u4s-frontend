"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useAccountEffect, useSignMessage, useSignTypedData } from "wagmi";
import { useUserStore } from "./useUserStore";
import { useTokenStore } from "./useTokenStore";
import { useEffect, useMemo } from "react";
import { vinaswapApi } from "@/services/axios";
import { siteConfig } from "@/config/site";
import { toaster } from "@/components/ui/toaster";
import { useDisconnect } from "@reown/appkit/react";

export const useWalletLogin = () => {
    const queryClient = useQueryClient();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { setUser, clearUser, user } = useUserStore();
    const { setToken, clearToken, token } = useTokenStore();
    const { signTypedDataAsync, isPending: isSignPending, error: signError } = useSignTypedData();

    const authQuery = useQuery({
        queryKey: ["auth", address, JSON.stringify(user), JSON.stringify(token)],
        queryFn: async () => {
            if (user && token || !address) return;

            const domain = {
                name: siteConfig.name,
            };
            const message = {
                address,
                purpose: "Xác thực đăng nhập",
            };
            const primaryType = "Login";
            const types = {
                Login: [
                    { name: "address", type: "address" },
                    { name: "purpose", type: "string" },
                ],
            };

            const signature = await signTypedDataAsync({
                domain,
                message,
                primaryType,
                account: address,
                types,
            });

            const res = await vinaswapApi.post("/auth/wallet-login", {
                domain,
                message,
                signature,
                address,
                types,
            });

            if (res.data) {
                setUser(res.data.user);
                setToken(res.data.token);
                vinaswapApi.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
            }

            queryClient.invalidateQueries({ queryKey: ["auth:status"] });
            toaster.success({
                title: "Đăng nhập thành công",
                description: "Hãy tận hưởng trải nghiệm trên " + siteConfig.name,
            })
        },
        enabled: !!address && !token && !user,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: true,
    });



    // Handle disconnect
    useAccountEffect({
        onDisconnect: () => {
            clearUser();
            clearToken();
            delete vinaswapApi.defaults.headers.common["Authorization"];
        },
    });


    const isLoading = useMemo(() => {
        return (authQuery.isLoading || isSignPending) && !user && !token;
    }, [authQuery.isLoading, isSignPending, user, token]);
    const error = signError || authQuery.error;
    const isAuthenticated = useMemo(() => {
        return !!user && !!token;
    }, [user, token]);

    useEffect(() => {
        if (error) {
            console.error("Authentication error:", error);
            disconnect();
        }
    }, [error]);

    return {
        isLoading,
        isAuthenticated,
        error,
    };
};