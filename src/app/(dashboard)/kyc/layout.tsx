import { VStack } from "@chakra-ui/react";
import Script from "next/script";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            {children}
            <Script
                src="/web-sdk-version-3.2.0.0.js"
                strategy="beforeInteractive"
                id="web-sdk"
            />
        </>
    );
}
