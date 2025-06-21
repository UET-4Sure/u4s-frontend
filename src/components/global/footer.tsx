"use client";

import { siteConfig } from "@/config/site";
import { chakra, Text, HtmlProps, Box, Heading, HStack, Span, Center, Image } from "@chakra-ui/react";
import NextImage from "next/image";

import { BrandLogo } from "./brand";

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
            overflow={"hidden"}
            {...props}
        >
            <FooterCover />
            <HStack w={"full"}>
                <Box>
                    <BrandLogo />
                    <Heading as={"h1"} size={"4xl"} color={"primary.solid"} w={"full"} textAlign={"start"}>
                        {siteConfig.name}
                    </Heading>
                    <Text fontSize={"md"} color={"fg.subtle"}>
                        Defi của người Việt, vì người Việt
                    </Text>
                </Box>
            </HStack>
            <Box pos={"absolute"} bottom={"4"} right={"4"} w={"fit"}>
                <Text fontSize={"xs"} color={"secondary.muted"}>© {new Date().getFullYear()} VinaSwap. All rights reserved</Text>
                <Text fontSize={"xs"} color={"secondary.muted"}>
                    Made with by the <Span fontWeight={"semibold"}>&nbsp;UETForSure&nbsp;</Span>team.
                </Text>
            </Box>
        </chakra.footer>
    );
}

const FooterCover = () => (
    <Center position={"absolute"} left={"50%"} top={"50%"} transform={"translate(-50%, -50%)"} pointerEvents={"none"}>
        <Image h={"full"} aspectRatio={1280 / 853} asChild>
            <NextImage
                src="/assets/bg-cover-onepillarpagoda.png"
                alt="Footer Cover Image"
                width={1280}
                height={853}
                priority
            />
        </Image>
    </Center>
)