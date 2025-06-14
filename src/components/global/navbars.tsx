"use client"

import { siteConfig } from "@/config/site";
import { chakra, For, HStack, HtmlProps, Image, Link, Text, VStack } from "@chakra-ui/react"
import NextImage from "next/image";
import { Tag } from "../ui/tag";
import { APP_VERSION } from "@/config/constants";
import { ProfileMenu } from "@/app/(dashboard)/_components/ProfileMenu";
import { ConnectWalletButton } from "./wallet";
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from "../ui/hover-card";
const ChakraHeader = chakra.header;

const Brand = () => (
    <Image asChild>
        <NextImage
            src="/RootFaviconLight.png"
            alt="Brand Logo"
            width={48}
            height={48}
        />
    </Image>
);

const VersionTag = () => (
    <Tag size={"md"} rounded={"full"} colorPalette={"secondary"} variant={"solid"}>
        {APP_VERSION}
    </Tag>
);

const BrandAndAppSnippet = () => (
    <HStack align={"start"} justify={"center"} gap={"1"}>
        <Brand />
        <VStack align={"start"} justify={"center"} gap={"1"}>
            <Text fontSize={"md"} fontWeight={"semibold"}>{siteConfig.name}</Text>
            <VersionTag />
        </VStack>
    </HStack >
)

interface LandingNavbarProps extends HtmlProps { }
export const LandingNavbar: React.FC<LandingNavbarProps> = (props) => {
    const NavLinks = () => (
        <HStack flex={"1"} as={"nav"} align={"center"} justify={"center"} gap={"8"}>
            <For each={Object.entries(siteConfig.paths)}>
                {([key, path]) => (
                    <Link key={key} href={path.href}>{path.label}</Link>
                )}
            </For>
        </HStack>
    );

    return (
        <ChakraHeader
            position="sticky"
            w={"full"}
            top={0}
            left={0}
            right={0}
            {...props}
        >
            <HStack gap={"8"} justify={"space-between"} align={"center"} p={4}>
                <BrandAndAppSnippet />
                <NavLinks />
                <ConnectWalletButton />
            </HStack>
        </ChakraHeader>
    );
}

interface DashboardNavbarProps extends HtmlProps { }
export const DashboardNavbar: React.FC<DashboardNavbarProps> = (props) => {
    const featLinks = [
        { label: "Trao đổi", href: "/dashboard/swap" },
        { label: "Mua", href: "/dashboard/buy" },
        { label: "Bán", href: "/dashboard/sell" },
    ]
    const NavLinks = () => (
        <HStack flex={"1"} as={"nav"} align={"center"} justify={"center"} gap={"8"}>
            <For each={featLinks}>
                {(path) => (
                    <Link key={path.label} href={path.href}>{path.label}</Link>
                )}
            </For>
        </HStack>
    );

    const TradeMenu = () => (
        <HoverCardRoot openDelay={100}>
            <HoverCardTrigger asChild>
                <Link href={"/dashboard/trade"}>Giao dịch</Link>
            </HoverCardTrigger>
            <HoverCardContent>
                <VStack align={"start"}>
                    <For each={featLinks}>
                        {(path) => (
                            <Link href={path.href} key={path.label}>
                                {path.label}
                            </Link>
                        )}
                    </For>
                </VStack>
            </HoverCardContent>
        </HoverCardRoot>
    )

    return (
        <ChakraHeader
            position="sticky"
            w={"full"}
            top={0}
            left={0}
            right={0}
            {...props}
        >
            <HStack gap={"8"} justify={"space-between"} align={"center"} p={4}>
                <BrandAndAppSnippet />
                <HStack flex={"1"}>
                    <TradeMenu />
                </HStack>
                <ProfileMenu />
            </HStack>
        </ChakraHeader>
    );
}