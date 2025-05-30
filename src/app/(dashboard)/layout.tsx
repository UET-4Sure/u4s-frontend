import { VStack } from "@chakra-ui/react";
import { Provider } from "./provider";
import { DashboardNavbar } from "@/components/global/navbars";
import { headers } from "next/headers";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookies = (await headers()).get('cookie')

    return (
        <Provider cookies={cookies}>
            <VStack>
                <DashboardNavbar />
                {children}
            </VStack>
        </Provider>
    );
}
