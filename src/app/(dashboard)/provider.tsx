"use client";

import { useAppKit } from "@reown/appkit/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { FallbackView } from "./_components/FallbackView";
import NextImage from "next/image";
import { Image } from "@chakra-ui/react";
import { useWalletLogin } from "@/hooks/useWalletLogin";
import { useQuery } from "@tanstack/react-query";
import { vinaswapApi } from "@/services/axios";
import { KycStatus, User } from "@/types/core";
import { useUserStore } from "@/hooks/useUserStore";
import { checkHasSBT } from "@/script/CheckHasSBT";

interface ProviderProps extends React.PropsWithChildren { }
export const Provider: React.FC<ProviderProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useWalletLogin();

    const { open } = useAppKit();
    const { address } = useAccount();
    const { setUser } = useUserStore();

    useQuery({
        queryKey: ["wallet", address],
        queryFn: async () => {
            const res = await vinaswapApi.get(`/users/wallet/${address}`)
            const hasSBT = await checkHasSBT(address as `0x${string}`) as boolean;

            const user = res.data as User;
            setUser({
                ...user,
                kycStatus: hasSBT ? KycStatus.APPROVED : KycStatus.NONE,
            });
        },
        enabled: !!address && isAuthenticated,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            open({
                view: "Connect",
            });
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <>
            <Image asChild pos={"absolute"} pointerEvents={"none"} zIndex={"-1"}>
                <NextImage
                    src={"/assets/bg-cover-plateau.png"}
                    alt={"Plateau Background"}
                    fill
                />
            </Image>
            <FallbackView
                label="Bạn chưa kết nối ví"
                subtitle="Vui lòng kết nối ví để tiếp tục"
            />
        </>;
    };

    return (
        <>
            {children}
        </>
    );
};