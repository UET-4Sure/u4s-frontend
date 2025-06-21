import { VStack } from "@chakra-ui/react";
import { LandingNavbar } from "@/components/global/navbars";


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <VStack overflow={"auto"} minH={"100vh"} w={"full"} >
            <LandingNavbar />
            {children}
        </VStack >
    );
}
