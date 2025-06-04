"use client";

import { useAppKit } from "@reown/appkit/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { FallbackView } from "./_components/FallbackView";

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
        return <FallbackView
            label="Bạn chưa kết nối ví"
            subtitle="Vui lòng kết nối ví để tiếp tục"
        />;
    };

    return (
        <>
            {children}
        </>
    );
};