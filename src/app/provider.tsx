"use client"

import { Config, cookieToInitialState, WagmiProvider } from 'wagmi'
import reown from '@/utils/reown';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { Provider as ChakraProvider } from "@/components/ui/provider";

const queryClient = new QueryClient();

createAppKit(reown.appKit);

export function Provider({
    children,
    cookies,
}: Readonly<{
    children: React.ReactNode;
    cookies: string | null;
}>) {
    const initialState = cookieToInitialState(reown.wagmiAdapter.wagmiConfig as Config, cookies);

    return (
        <>
            <WagmiProvider config={reown.wagmiAdapter.wagmiConfig} initialState={initialState}>
                <QueryClientProvider client={queryClient}>
                    <ChakraProvider>
                        {children}
                    </ChakraProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </>
    );
}