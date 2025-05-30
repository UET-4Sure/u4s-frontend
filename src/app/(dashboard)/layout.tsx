import { VStack } from "@chakra-ui/react";
import { Provider } from "./provider";
import { DashboardNavbar } from "@/components/global/navbars";


export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Provider>
            <VStack>
                <DashboardNavbar />
                {children}
            </VStack>
        </Provider>
    );
}
