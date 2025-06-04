"use client";

import { useAppKit, useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import { Button, ButtonProps } from "../ui/button";
import { useMemo } from "react";

interface ConnectWalletButtonProps extends ButtonProps {
}
export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = (props) => {
    const { open, } = useAppKit();
    const { status } = useAppKitAccount();

    const isLoading = useMemo(() => {
        return status === "connecting";
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
            Kết nối
        </Button>
    );
}