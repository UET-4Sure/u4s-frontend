import { VStack } from "@chakra-ui/react";
import { Provider } from "./provider";


export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Provider>
            {children}
        </Provider>
    );
}
