"use client"

import { Button, ButtonProps } from "@/components/ui/button";
import { signOut, signIn, useSession } from "next-auth/react";

interface Props extends ButtonProps {
    authenticator?: string;
}
export const SignInButton: React.FC<Props> = (props) => {
    const { authenticator } = props;
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
            Sign In with {authenticator || "Credentials"}
        </Button>
    );
};
