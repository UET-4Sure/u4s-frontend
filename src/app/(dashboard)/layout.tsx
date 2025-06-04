import { VStack } from "@chakra-ui/react";
import { DashboardNavbar } from "@/components/global/navbars";
import { Provider } from "./provider";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <VStack>
            <Provider>
                <DashboardNavbar />
                {children}
            </Provider>
        </VStack>
    );
}
