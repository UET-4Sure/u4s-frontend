"use client";

import { Box, Flex, HStack, Heading, HtmlProps, Image, Span, Text, chakra } from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextImage from "next/image";
import { ExploreButton } from "./_components/ExploreButton";
import { ConnectWalletButton } from "@/components/global/wallet";
import { StartButton } from "./_components/StartButton";

const MotionHeading = motion.create(Heading);
const MotionText = motion.create(Text);
const MotionHStack = motion.create(HStack);
const MotionImage = motion.create(Image);

interface HeroSectionProps extends HtmlProps { }
export const HeroSection: React.FC<HeroSectionProps> = (props) => {
    return (
        <chakra.section px={["4", "8"]} m={"auto"} mt={["8", "12"]} pb={["16", "24"]} {...props}>
            <Flex justify={"space-between"} align={"center"} flexDir={["column", "column", "row", "row", "row"]} gap={["8", "16"]}>
                <Box
                    maxW={["100%", "100%", "sm", "md", "lg"]}
                    flex={"1"}
                >
                    <MotionText
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        fontSize={["md", "lg", "xl", "2xl"]}
                        fontWeight={"medium"}
                        color={"fg.subtle"}
                    >
                        DeFi của người Việt, vì người Việt
                    </MotionText>
                    <MotionHeading
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        as={"h1"} size={["lg", "2xl", "3xl", "4xl"]} mt={"1"}
                        color={"fg"}
                    >
                        Tinh thần
                        <Span fontWeight={"semibold"} color={"primary"}> Việt Nam </Span>
                        tương lai phi tập trung – kỷ nguyên mới bắt nguồn từ văn hoá.
                    </MotionHeading>
                    <MotionText
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        mt={"6"}
                    >
                        Xây dựng trên Uniswap V4, VinaSwap cung cấp nền tảng DeFi hiện đại, minh bạch, an toàn, phục vụ cộng đồng Việt và thúc đẩy hệ sinh thái DeFi phát triển bền vững
                    </MotionText>
                    <MotionHStack
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        gap={"4"}
                        my={"6"}
                    >
                        <StartButton />
                        <ExploreButton />
                    </MotionHStack>
                </Box>
                <MotionImage
                    w={["100%", "100%", "320px", "480", "640px"]}
                    aspectRatio={640 / 512}
                    asChild
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 128, damping: 20 }}
                >
                    <NextImage
                        src="/assets/poster-hero.png"
                        alt="Hero Image"
                        priority
                        width={640}
                        height={512}
                    />
                </MotionImage>
            </Flex>
        </chakra.section >
    );
};