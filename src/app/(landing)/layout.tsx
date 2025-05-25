import { VStack } from "@chakra-ui/react";
import { LandingNavbar } from "@/components/global/navbars";


export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <VStack>
            <LandingNavbar />
            {children}
        </VStack>
    );
}
