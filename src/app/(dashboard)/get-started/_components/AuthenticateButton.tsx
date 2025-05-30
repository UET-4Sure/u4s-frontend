"use client"

import { Button, ButtonProps } from "@/components/ui/button";
import { signOut, signIn, useSession } from "next-auth/react";
import { useAppKit } from "@reown/appkit/react";

interface Props extends ButtonProps {
    authenticator?: string;
    label?: string;
}
export const SignInButton: React.FC<Props> = (props) => {
    const { authenticator, label } = props;
    const { data: session } = useSession();

    return (
        <Button
            onClick={() => {
                if (session) {
                    signOut();
                } else {
                    signIn(authenticator || "credentials");
                }
            }}
            {...props}
        >
            {label}
        </Button>
    );
};

interface ConnectWalletButtonProps extends ButtonProps {
}
export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = (props) => {
    const {open, } = useAppKit();
    return (
        <Button
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