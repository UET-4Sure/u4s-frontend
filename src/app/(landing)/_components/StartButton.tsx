"use client";

import { ConnectWalletButton } from "@/components/global/wallet";
import { ButtonProps, Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useWalletLogin } from "@/hooks/useWalletLogin";
import { useRouter } from "next/navigation";

interface StartButtonProps extends ButtonProps { }
export const StartButton: React.FC<StartButtonProps> = (props) => {
    const { isAuthenticated } = useWalletLogin();
    const router = useRouter();
    if (!isAuthenticated) {
        return <ConnectWalletButton />
    }

    return (
        <Button
            onClick={() => { router.push("/dashboard") }}
            colorPalette={isAuthenticated ? "primary" : "gray"}
            {...props}
        >
            Bắt đầu ngay
        </Button>
    )
}