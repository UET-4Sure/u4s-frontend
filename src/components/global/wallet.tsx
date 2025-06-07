"use client";

import { useAppKit, useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import { Button, ButtonProps } from "../ui/button";
import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { vinaswapApi } from "@/services/axios";
import { useSignMessage } from "wagmi";

interface ConnectWalletButtonProps extends ButtonProps {
}
export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = (props) => {
    const { open, } = useAppKit();
    const { address, status } = useAppKitAccount();
    const {
        data: signature,
        signMessageAsync,
        isPending,
        isSuccess,
        error,
    } = useSignMessage();
    
    const { data: nonce, isLoading: isNonceLoading } = useQuery({
        queryKey: ["auth:get:nonce", address],
        enabled: !!address,
        queryFn: async () => {
            const res = await vinaswapApi.get(`/auth/nonce?address=${address}`);
            return res.data.nonce as string;
        },
    });

    const { } = useQuery({
        queryKey: ["auth:wallet-login", address, nonce],
        enabled: !!address && !!nonce,
        queryFn: async () => {
            if (!nonce) return;
            const res = await vinaswapApi.post("/auth/wallet-login", {
                address,
                nonce
            });
            return res.data;
        }
    })

    const isLoading = useMemo(() => {
        return status === "connecting" || status === "reconnecting" || isNonceLoading;
    }, [status]);

    return (
        <Button
            disabled={isLoading}
            onClick={() => {
                open({
                    view: "Connect"
                })
            }}
            {...props}
        >
            Connect Wallet
        </Button>
    );
}