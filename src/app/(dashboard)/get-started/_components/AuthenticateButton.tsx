"use client"

import { Button, ButtonProps } from "@/components/ui/button";
import { walletConnectConnector } from "@/utils/wagmi";
import { signOut, signIn, useSession } from "next-auth/react";
import { useConnect } from "wagmi";
import { injected } from 'wagmi/connectors'

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
    const { connect } = useConnect();

    return (
        <Button
            onClick={() => {
                connect({
                    connector: injected(),
                });
            }}
            {...props}
        >
            Connect Wallet
        </Button>
    );
}