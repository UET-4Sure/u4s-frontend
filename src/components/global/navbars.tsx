"use client"

import { siteConfig } from "@/config/site";
import { chakra, For, HStack, HtmlProps, Image, Link } from "@chakra-ui/react"
import NextImage from "next/image";
import { Tag } from "../ui/tag";
import { APP_VERSION } from "@/config/constants";
import { ProfileMenu } from "@/app/(dashboard)/_components/ProfileMenu";
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
    <Tag size={"lg"} rounded={"full"} colorPalette={"secondary"} variant={"solid"}>
        {APP_VERSION}
    </Tag>
);

interface LandingNavbarProps extends HtmlProps { }
export const LandingNavbar: React.FC<LandingNavbarProps> = (props) => {
    const NavLinks = () => (
        <HStack flex={"1"} as={"nav"} justify={"space-between"}>
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
            zIndex={"sticky"}
            {...props}
        >
            <HStack gap={"8"} justify={"space-between"} align={"center"} p={4}>
                <Brand />
                <NavLinks />
                <VersionTag />
            </HStack>
        </ChakraHeader>
    );
}

interface DashboardNavbarProps extends HtmlProps { }
export const DashboardNavbar: React.FC<DashboardNavbarProps> = (props) => {
    return (
        <ChakraHeader
            as="nav"
            position="sticky"
            top={0}
            left={0}
            right={0}
            zIndex={"sticky"}
            {...props}
        >
            <Brand />
            <HStack align={"center"}>
                <ProfileMenu />
                <VersionTag />
            </HStack>
        </ChakraHeader>
    );
}