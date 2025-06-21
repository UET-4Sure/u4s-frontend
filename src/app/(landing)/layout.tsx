import { VStack } from "@chakra-ui/react";
import NextJsTopLoader from "nextjs-toploader";

import { LandingNavbar } from "@/components/global/navbars";


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate delay for loading

    return (
        <VStack overflow={"auto"} minH={"100vh"} w={"full"} >
            <LandingNavbar />
            {children}
        </VStack >
    );
}
