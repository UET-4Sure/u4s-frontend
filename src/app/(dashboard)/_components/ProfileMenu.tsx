"use client";

import { AvatarFallback, AvatarImage, AvatarRoot, For, HStack, Spinner, StackProps, Text } from "@chakra-ui/react";
import { useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";

import { formatAddress } from "@/libs";
import { ConnectWalletButton } from "@/components/global/wallet";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { motion } from "framer-motion";
import { useWalletLogin } from "@/hooks/useWalletLogin";

const MotionMenuItem = motion.create(MenuItem);

interface Props extends StackProps { }
export const ProfileMenu: React.FC<Props> = ({ children, ...props }) => {
    const { disconnect } = useDisconnect()
    const router = useRouter();
    const { open } = useAppKit();
    const { address, status } = useAppKitAccount();
    const { isLoading, isAuthenticated } = useWalletLogin();

    const { data: ensName } = useEnsName({
        address: address as `0x${string}`,
        query: {
            enabled: !!address && isAuthenticated && !isLoading
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
                    src="/brand/logo-social-gradient.svg"
                    alt="Brand Logo"
                    fill
                />
            </AvatarFallback>
        </AvatarRoot>
    );

    const items = [
        {
            label: "Profile",
            icon: <FaUser />,
            action: () => {
                router.push(`/profile/${address}`);
            }
        },
        {
            label: "Wallet",
            icon: <NextImage src={"/assets/logo-connect-wallet.svg"} alt="Connect Wallet" width={16} height={16} />,
            action: () => open({
                view: "Account"
            })
        }
    ]

    if (!isAuthenticated && !isLoading) return <ConnectWalletButton />;

    return (
        <MenuRoot>
            <MenuTrigger>
                <HStack
                    rounded={"full"}
                    p={"2"}
                    bg={"bg.subtle"}
                    shadow={"sm"}
                    cursor={"pointer"}
                    {...props}
                >
                    <ProfileAvatar />
                    {isLoading &&
                        <>
                            <Text fontSize={"sm"} fontWeight={"semibold"} color={"fg.muted"}>Connecting</Text>
                            <Spinner color={"fg.muted"} size={"sm"} />
                        </>
                    }
                    {isAuthenticated && <Text fontSize={"sm"} fontWeight={"medium"}>{formatAddress(address)}</Text>}
                </HStack>
            </MenuTrigger>
            <MenuContent>
                <For each={items} >
                    {(item) => (
                        <MotionMenuItem
                            rounded={"lg"}
                            value={item.label}
                            key={item.label}
                            whileHover={{
                                scale: 1.02,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            onClick={() => {
                                item.action();
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </MotionMenuItem>
                    )}
                </For>
            </MenuContent>
        </MenuRoot>
    );
};