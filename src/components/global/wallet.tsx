"use client";

import { useAppKit, useAppKitAccount, useAppKitProvider, useAppKitState } from "@reown/appkit/react";
import { Button, ButtonProps } from "../ui/button";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { vinaswapApi } from "@/services/axios";
import { useSignMessage } from "wagmi";
import { useWalletLogin } from "@/hooks/useWalletLogin";

interface ConnectWalletButtonProps extends ButtonProps {
}
export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = (props) => {
    const { open, } = useAppKit();
    const { isLoading } = useWalletLogin();
    
    return (
        <Button
            disabled={isLoading}
            loading={isLoading}
            onClick={() => {
                open({
                    view: "Connect"
                })
            }}
            {...props}
        >
            Kết nối
        </Button>
    );
}