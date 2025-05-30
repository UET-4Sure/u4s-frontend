"use client";

import { AvatarFallback, AvatarImage, AvatarRoot, HStack, Image, Spinner, StackProps, Text } from "@chakra-ui/react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import NextImage from "next/image";
import { useMemo } from "react";

interface Props extends StackProps { }
export const ProfileMenu: React.FC<Props> = ({ children, ...props }) => {
    const { disconnect } = useDisconnect()
    const { open } = useAppKit();
    const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount();
    const isConnecting = useMemo(() => status === "reconnecting" || status === "connecting", [status]);

    // const { data: ensName } = useEnsName({ address })
    // const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

    const ProfileAvatar = () => (
        <AvatarRoot size={"2xs"}>
            <AvatarImage alt="ENS Avatar" src={""} />
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
        <HStack
            rounded={"full"}
            p={"2"}
            bg={"bg.subtle"}
            shadow={"sm"}
            cursor={"pointer"}
            onClick={() => open({
                view: "Account"
            })}
            {...props}>
            <ProfileAvatar />
            {isConnecting &&
                <>
                    <Text fontSize={"sm"} fontWeight={"semibold"} color={"fg.muted"}>Connecting</Text>
                    <Spinner color={"fg.muted"} size={"sm"} />
                </>
            }
            <Text fontSize={"sm"} fontWeight={"semibold"} truncate>{address}</Text>
        </HStack>
    );
};