"use client"

import { WagmiProvider } from 'wagmi'
import { SessionProvider } from "next-auth/react";
import { config as wagmiConfig } from "@/utils/wagmi"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    <SessionProvider>
                        {children}
                    </SessionProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </>
    );
}