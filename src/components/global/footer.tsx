"use client";

import { chakra, Text, HtmlProps, Box } from "@chakra-ui/react";

interface FooterProps extends HtmlProps { }
export const Footer: React.FC<FooterProps> = (props) => {
    return (
        <chakra.footer
            w={"full"}
            aspectRatio={6 / 1}
            px={["4", "8"]}
            py={["8", "12"]}
            color={"secondary.subtle"}
            textAlign={"center"}
            bgImage="radial-gradient(100% 100% at 50.1% 0%, #FFA103 0%, #BC2D29 41.35%, #450E14 100%)"
            pos={"relative"}
            {...props}
        >   
            <Box pos={"sticky"} bottom={0} right={0}>
                <Text fontSize={"xs"}>© {new Date().getFullYear()} VinaSwap. All rights reserved.</Text>
                <Text fontSize={"xs"} mt={2}>
                    Made with by the UETForSure team.
                </Text>
            </Box>
        </chakra.footer>
    );
}