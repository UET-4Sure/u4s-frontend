import { VStack } from "@chakra-ui/react";
import { DashboardNavbar } from "@/components/global/navbars";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <VStack>
            <DashboardNavbar />
            {children}
        </VStack>
    );
}
