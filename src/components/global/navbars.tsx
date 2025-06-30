"use client"

import { siteConfig } from "@/config/site";
import { chakra, For, HStack, HtmlProps, Icon, Image, Link, Text, VStack } from "@chakra-ui/react"
import NextImage from "next/image";
import NextLink from "next/link";
import { FaRegEyeSlash } from "react-icons/fa";

import { Tag } from "../ui/tag";
import { APP_VERSION } from "@/config/constants";
import { ProfileMenu } from "@/app/(dashboard)/_components/ProfileMenu";
import { ConnectWalletButton } from "./wallet";
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from "../ui/hover-card";
import { Button } from "../ui/button";

import { BrandLogo } from "./brand";
import { useWalletLogin } from "@/hooks/useWalletLogin";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Tooltip } from "../ui/tooltip";
const ChakraHeader = chakra.header;

const Brand = () => (
    <Image asChild>
        <NextImage
            src="/brand/logo-favicon.svg"
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
    <NextLink href={"/dashboard"}>
        <HStack align={"start"} justify={"center"} gap={"1"}>
            <BrandLogo />
            <VStack align={"start"} justify={"center"} gap={"1"}>
                <Text fontSize={"md"} fontWeight={"semibold"}>{siteConfig.name}</Text>
                <VersionTag />
            </VStack>
        </HStack >
    </NextLink>
)

const ConnectWalletButtonWrapper = () => {
    const { isAuthenticated } = useWalletLogin();
    if (isAuthenticated) return null;
    return <ConnectWalletButton />;
};

interface LandingNavbarProps extends HtmlProps { }
export const LandingNavbar: React.FC<LandingNavbarProps> = memo((props) => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path || pathname.startsWith(path);

    const NavLinks = () => (
        <HStack flex={"1"} as={"nav"} align={"center"} justify={"start"} gap={"4"}>
            <For each={Object.entries(siteConfig.paths)}>
                {([key, path]) => (
                    <Link key={key} href={path.href}
                        target={path.label !== "Trang chủ" ? "_blank" : "_self"}
                        unstyled
                        color={isActive(path.href) ? "fg" : "fg.muted"}
                        transition="all 0.3s ease-in-out"
                        _hover={{
                            color: "fg",
                        }}>
                        {path.label}
                    </Link>
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
                <ConnectWalletButtonWrapper />
            </HStack>
        </ChakraHeader>
    );
});

interface DashboardNavbarProps extends HtmlProps { }
export const DashboardNavbar: React.FC<DashboardNavbarProps> = (props) => {
    const { scrollY } = useScroll();
    const [scrollYValue, setScrollYValue] = useState(0);
    const pathname = usePathname();

    const isActivePage = (path: string) => pathname.startsWith(path);

    const featLinks = [
        { label: "Trao đổi", href: "/swap" },
        { label: "Mua", href: "/buy", isCommingSoon: true },
        { label: "Bán", href: "/sell", isCommingSoon: true },
        { label: "DCA", href: "/dca", isCommingSoon: true },
        { label: "Limit", href: "/limit", isCommingSoon: true },
        { label: "Perpetual", href: "/perpetual", isCommingSoon: true },
    ]

    const TradeMenu = () => (
        <HoverCardRoot openDelay={100}>
            <HoverCardTrigger asChild>
                <Link
                    href={featLinks[0].href}
                    _hover={{
                        color: "fg",
                    }}
                    transition={"color 0.3s ease-in-out"}
                    color={
                        isActivePage("/swap") || isActivePage("/buy") || isActivePage("/sell")
                            ? "fg" : "fg.muted"
                    }
                    unstyled
                    asChild
                >
                    <NextLink href={featLinks[0].href}>
                        Giao dịch
                    </NextLink>
                </Link>
            </HoverCardTrigger>
            <HoverCardContent p={"2"}>
                <VStack align={"start"}>
                    <For each={featLinks}>
                        {(path, index) =>
                            path.isCommingSoon ? (
                                <Tooltip
                                    key={index}
                                    positioning={{
                                        placement: "right",
                                        offset: {
                                            mainAxis: 16,
                                            crossAxis: 0,
                                        },
                                    }}
                                    content={`Tính năng sẽ sớm được ra mắt`}
                                    openDelay={100}
                                >
                                    <Button disabled={path.isCommingSoon} w="full" rounded={"lg"} bg={"bg.muted"} color={"fg"}>
                                        {path.isCommingSoon && <Icon as={FaRegEyeSlash} />}
                                        {path.label}
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Button key={index} w="full" rounded={"lg"} bg={"bg.muted"} color={"fg"} asChild>
                                    <Link href={path.href} key={path.label}>
                                        {path.label}
                                    </Link>
                                </Button>
                            )
                        }
                    </For>
                </VStack>
            </HoverCardContent>
        </HoverCardRoot>
    )

    const PoolMenu = () => {
        const featLinks = [
            { label: "Tạo vị thế", href: "/positions/create" },
            { label: "Xem vị thế", href: "/positions/list" },
        ]

        return (
            <HoverCardRoot openDelay={100}>
                <HoverCardTrigger asChild>
                    <Link
                        _hover={{
                            color: "fg",
                        }}
                        transition={"color 0.3s ease-in-out"}
                        color={
                            pathname.startsWith("/positions") || pathname.startsWith("/pools")
                                ? "fg" : "fg.muted"}
                        unstyled
                        asChild
                    >
                        <NextLink href={featLinks[0].href}>
                            Pool
                        </NextLink>
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent p={"2"}>
                    <VStack align={"start"}>
                        <For each={featLinks}>
                            {(path) => (
                                <Button key={path.label} w="full" rounded={"lg"} bg={"bg.muted"} color={"fg"} asChild>
                                    <Link href={path.href}>
                                        {path.label}
                                    </Link>
                                </Button>
                            )}
                        </For>
                    </VStack>
                </HoverCardContent>
            </HoverCardRoot>
        )
    }

    const FaucetMenu = () => (
        <Link
            _hover={{
                color: "fg",
            }}
            transition={"color 0.3s ease-in-out"}
            color={isActivePage("/faucet") ? "fg" : "fg.muted"}
            unstyled
            asChild
        >
            <NextLink
                href={"/faucet"}
            >
                Faucet
            </NextLink>
        </Link>
    )

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrollYValue(latest);
        console.log("bg/" + ((Math.floor(latest * 2) % 101) > 100 ? "100" : Math.floor(latest * 2) % 101))
    });

    return (
        <ChakraHeader
            position="sticky"
            bg={"bg/" + (scrollYValue * 2 > 100 ? "100" : scrollYValue * 2)}
            shadow={scrollYValue > 0 ? "md" : "none"}
            transition={"box-shadow 0.5s ease-in-out"}
            zIndex={"sticky"}
            w={"full"}
            top={0}
            left={0}
            right={0}
            {...props}
        >
            <HStack gap={"8"} justify={"space-between"} align={"center"} p={4}>
                <BrandAndAppSnippet />
                <HStack flex={"1"} gap={"4"}>
                    <TradeMenu />
                    <FaucetMenu />
                    <PoolMenu />
                </HStack>
                <ProfileMenu />
            </HStack>
        </ChakraHeader>
    );
}