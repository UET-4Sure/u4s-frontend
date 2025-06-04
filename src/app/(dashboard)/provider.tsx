"use client";

import { useAppKit } from "@reown/appkit/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

interface ProviderProps extends React.PropsWithChildren { }
export const Provider: React.FC<ProviderProps> = ({ children }) => {
    const { isConnected } = useAccount();
    const { open } = useAppKit();


    useEffect(() => {
        if (!isConnected) {
            open({
                view: "Connect",
            });
        }
    }, [isConnected]);

    if (!isConnected) {
        return null;
    };

    return (
        <>
            {children}
        </>
    );
};