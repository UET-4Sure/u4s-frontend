import { VStack } from "@chakra-ui/react";
import { DashboardNavbar } from "@/components/global/navbars";
import { Provider } from "./provider";
import { CoverBackground } from "./_components/CoverBackground";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <VStack w={"full"} h={"full"} minH={"100vh"}>
            <DashboardNavbar />
            <Provider>
                {children}
            </Provider>
            <CoverBackground/>
        </VStack>
    );
}
