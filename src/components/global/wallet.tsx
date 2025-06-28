"use client";

import { useAppKit } from "@reown/appkit/react";
import { Button, ButtonProps } from "../ui/button";
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
            loadingText="Đang kết nối..."
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