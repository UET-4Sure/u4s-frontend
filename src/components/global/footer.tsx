"use client";

import { siteConfig } from "@/config/site";
import { chakra, Text, HtmlProps, Box, Heading, HStack, VStack, Span, Center, Image, Link, Flex, Grid, GridItem } from "@chakra-ui/react";
import NextImage from "next/image";

import { BrandLogo } from "./brand";

interface FooterProps extends HtmlProps { }
export const Footer: React.FC<FooterProps> = (props) => {
    return (
        <chakra.footer
            w={"full"}
            minH={"400px"}
            px={["4", "8", "16"]}
            py={["8", "12", "16"]}
            color={"secondary.subtle"}
            bgImage="radial-gradient(100% 100% at 50.1% 0%, #FFA103 0%, #BC2D29 41.35%, #450E14 100%)"
            pos={"relative"}
            overflow={"hidden"}
            {...props}
        >
            <FooterCover />

            {/* Main Footer Content */}
            <Grid
                templateColumns={["1fr", "1fr", "2fr 1fr 1fr"]}
                gap={["8", "12", "16"]}
                w={"full"}
                maxW={"7xl"}
                mx={"auto"}
                position={"relative"}
                zIndex={1}
            >
                {/* Brand Section */}
                <GridItem>
                    <VStack align={"start"} gap={4}>
                        <Box>
                            <BrandLogo />
                            <Heading as={"h1"} size={["2xl", "3xl", "4xl"]} color={"primary.solid"} mt={2}>
                                {siteConfig.name}
                            </Heading>
                        </Box>
                        <Text fontSize={["sm", "md"]} color={"secondary.subtle"} maxW={"md"}>
                            {siteConfig.description}
                        </Text>
                        <Text fontSize={["sm", "md"]} color={"secondary.muted"} fontWeight={"semibold"}>
                            Defi của người Việt, vì người Việt
                        </Text>
                    </VStack>
                </GridItem>

                {/* Navigation Links */}
                <GridItem>
                    <VStack align={["start", "start", "center"]} gap={4}>
                        <Heading as={"h3"} size={"lg"} color={"primary.solid"}>
                            Điều hướng
                        </Heading>
                        <VStack align={["start", "start", "center"]} gap={3}>
                            <Link
                                href={siteConfig.paths.home.href}
                                color={"secondary.muted"}
                                fontSize={"md"}
                                _hover={{ color: "primary.solid", textDecoration: "none" }}
                                transition={"color 0.2s"}
                            >
                                {siteConfig.paths.home.label}
                            </Link>
                            <Link
                                href={siteConfig.paths.docs.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                color={"secondary.muted"}
                                fontSize={"md"}
                                _hover={{ color: "primary.solid", textDecoration: "none" }}
                                transition={"color 0.2s"}
                            >
                                {siteConfig.paths.docs.label}
                            </Link>
                            <Link
                                href={siteConfig.paths.pitch.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                color={"secondary.muted"}
                                fontSize={"md"}
                                _hover={{ color: "primary.solid", textDecoration: "none" }}
                                transition={"color 0.2s"}
                            >
                                {siteConfig.paths.pitch.label}
                            </Link>
                        </VStack>
                    </VStack>
                </GridItem>

                {/* Social Links & Info */}
                <GridItem>
                    <VStack align={["start", "start", "end"]} gap={4}>
                        <Heading as={"h3"} size={"lg"} color={"primary.solid"}>
                            Kết nối
                        </Heading>
                        <VStack align={["start", "start", "end"]} gap={3}>
                            <Link
                                href={siteConfig.socials.twitter.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                color={"secondary.contrast"}
                                fontSize={"md"}
                                _hover={{ color: "primary.solid", textDecoration: "none" }}
                                transition={"color 0.2s"}
                            >
                                {siteConfig.socials.twitter.label}
                            </Link>
                        </VStack>
                    </VStack>
                </GridItem>
            </Grid>

            {/* Footer Bottom */}
            <Box
                pos={"absolute"}
                bottom={["2", "4"]}
                left={["4", "8", "16"]}
                right={["4", "8", "16"]}
                borderTop={"1px solid"}
                borderColor={"whiteAlpha.300"}
                pt={4}
                zIndex={1}
            >
                <Flex
                    direction={["column", "row"]}
                    justify={"space-between"}
                    align={["start", "center"]}
                    gap={2}
                >
                    <Text fontSize={"xs"} color={"secondary.muted"}>
                        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved
                    </Text>
                    <Text fontSize={"xs"} color={"secondary.muted"}>
                        Made with ❤️ by the <Span fontWeight={"semibold"} color={"primary.solid"}>UETForSure</Span> team.
                    </Text>
                </Flex>
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