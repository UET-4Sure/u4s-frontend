"use client";

import { Tag } from "@/components/ui/tag";
import { AvatarImage, AvatarRoot, Center, CenterProps, Image, Link, StackProps, Text, VStack } from "@chakra-ui/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { useEnsAvatar, useEnsName } from "wagmi";
import { FaCheck } from "react-icons/fa6";
import { formatAddress } from "@/libs";
import { FallbackView } from "@/app/(dashboard)/_components/FallbackView";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/useUserStore";
import { useMemo } from "react";
import { KycStatus } from "@/types/core";

interface KycArea extends CenterProps {
}
const KycArea: React.FC<KycArea> = ({ children, ...props }) => {
    const { user } = useUserStore();
    const isKyc = useMemo(() => user?.kycStatus === KycStatus.APPROVED, [user?.kycStatus]);

    if (!isKyc) {
        return (
            <Center w={"full"} h={"full"} flexDirection={"column"} {...props}>
                <FallbackView
                    label={
                        <Text fontSize={"2xl"} textAlign={"center"} color={"fg.muted"}>
                            Chưa xác minh danh tính
                        </Text>
                    }
                    description={
                        <Text textAlign={"center"} color={"fg.muted"}>
                            Xác minh danh tính để trải nghiệm được trọn vẹn nhất
                        </Text>
                    }
                    icon={
                        <Image
                            alt="Not Kyc Icon"
                            src="/assets/logo-not-kyc.png"
                            opacity={0.5}
                            pointerEvents={"none"}
                            fill="true"
                        />
                    }
                />
                <Link colorPalette={"primary"} href={"/kyc"}>
                    Xác minh ngay
                </Link>
            </Center>
        )
    }

    return (
        <Center {...props}>
            {children}
        </Center>
    );
}
interface Props extends StackProps {

}
export const ProfileArea: React.FC<Props> = ({ children, ...props }) => {
    const { address, isConnected } = useAppKitAccount();
    const { user } = useUserStore();
    const isKyc = useMemo(() => user?.kycStatus === KycStatus.APPROVED, [user?.kycStatus]);

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



    const Avatar = () => {
        return (
            <Center>
                <Image
                    alt="ENS Avatar"
                    src={ensAvatar || "/brand/logo-favicon.svg"}
                    width={"32"}
                    aspectRatio={"1/1"}
                />
            </Center>
        )
    }

    const InfoSnippet = () => {
        if (!user) return null;

        return (
            <VStack>
                <Tag
                    variant="solid"
                    colorPalette={isKyc ? "green" : "secondary"}
                    endElement={isKyc ? <FaCheck /> : undefined}
                >
                    {isKyc ? "Đã xác minh" : "Chưa xác minh"}
                </Tag>
                <Text fontSize={"lg"} textAlign={"center"} fontWeight={"semibold"}>
                    {user.id}
                </Text>
                <Link
                    href={`https://etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {ensName || address ? ensName || formatAddress(address) : "Chưa có địa chỉ"}
                </Link>
            </VStack>
        )
    }
    return (
        <VStack p={"4"} height={"full"} {...props}>
            <VStack>
                <Avatar />
                <InfoSnippet />
            </VStack>
            <KycArea />
        </VStack>
    );
};