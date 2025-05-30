"use client";

import { AvatarFallback, AvatarImage, AvatarRoot, HStack, Image, StackProps, Text } from "@chakra-ui/react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import NextImage from "next/image";

interface Props extends StackProps { }
export const ProfileMenu: React.FC<Props> = ({ children, ...props }) => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    const ProfileAvatar = () => (
        <AvatarRoot size={"2xs"}>
            <AvatarImage alt="ENS Avatar" src={ensAvatar!} />
            <AvatarFallback asChild>
                <NextImage
                    src="/BgLogoDark.png"
                    alt="Brand Logo"
                    fill
                />
            </AvatarFallback>
        </AvatarRoot>
    );

    return (
        <HStack rounded={"full"} p={"2"} bg={"bg.subtle"} shadow={"sm"} {...props}>
            <ProfileAvatar />
            {address && <Text fontSize={"md"} fontWeight={"medium"}>{ensName ? `${ensName} (${address})` : address}</Text>}
        </HStack>
    );
};