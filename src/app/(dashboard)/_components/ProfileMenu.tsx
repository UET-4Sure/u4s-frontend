"use client";

import { AvatarFallback, AvatarImage, AvatarRoot, HStack, Image, Spinner, StackProps, Text } from "@chakra-ui/react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import NextImage from "next/image";
import { useMemo } from "react";
import { formatAddress } from "@/libs";
import { ConnectWalletButton } from "@/components/global/wallet";

interface Props extends StackProps { }
export const ProfileMenu: React.FC<Props> = ({ children, ...props }) => {
    const { disconnect } = useDisconnect()
    const { open } = useAppKit();
    const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount();

    const isConnecting = useMemo(() => status === "reconnecting" || status === "connecting", [status]);

    const { data: ensName } = useEnsName({
        address: address as `0x${string}`,
        query: {
            enabled: isConnected && !!address,
        }
    })
    const { data: ensAvatar } = useEnsAvatar({
        name: ensName!,
        query: { enabled: !!ensName }
    });

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
    if (!isConnected && !isConnecting) return <ConnectWalletButton />;

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
            {...props}
        >
            <ProfileAvatar />
            {isConnecting &&
                <>
                    <Text fontSize={"sm"} fontWeight={"semibold"} color={"fg.muted"}>Connecting</Text>
                    <Spinner color={"fg.muted"} size={"sm"} />
                </>
            }
            <Text fontSize={"sm"} fontWeight={"medium"}>{formatAddress(address)}</Text>
        </HStack>
    );
};