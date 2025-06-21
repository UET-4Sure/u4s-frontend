"use client";

import { ConnectWalletButton } from "@/components/global/wallet";
import { ButtonProps } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useWalletLogin } from "@/hooks/useWalletLogin";
import { Button, Link, LinkProps } from "@chakra-ui/react";

interface StartButtonProps extends ButtonProps { }
export const StartButton: React.FC<StartButtonProps> = (props) => {
    const { isAuthenticated } = useWalletLogin();

    if (!isAuthenticated) {
        return <ConnectWalletButton />
    }

    return (
        <Link href={"/dashboard"} target="_blank" rel="noopener noreferrer" colorPalette="primary" color={"primary.solid"} asChild>
            <Button>
                Bắt đầu ngay
            </Button>
        </Link>
    )
}