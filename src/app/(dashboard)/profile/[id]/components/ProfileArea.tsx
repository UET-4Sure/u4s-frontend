"use client";

import { Tag } from "@/components/ui/tag";
import { AvatarImage, AvatarRoot, Center, CenterProps, Image, Link, StackProps, VStack } from "@chakra-ui/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { useEnsAvatar, useEnsName } from "wagmi";
import { FaCheck } from "react-icons/fa6";
import { formatAddress } from "@/libs";
import { FallbackView } from "@/app/(dashboard)/_components/FallbackView";

interface KycArea extends CenterProps {
    kycQuery: ReturnType<typeof useQuery>;
}
const KycArea: React.FC<KycArea> = ({ children, ...props }) => {
    const { kycQuery } = props;
    const { data: isKyc } = kycQuery;

    if (!isKyc) {
        return (
            <Center w={"full"} h={"full"} {...props}>
                <FallbackView
                    label="Chưa xác minh danh tính"
                    description="Xác minh danh tính để trải nghiệm được trọn vẹn nhất"
                    icon={
                        <Image
                            alt="Not Kyc Icon"
                            src="/assets/logo-not-kyc.png"
                            opacity={0.5}
                            fill="true"
                        />
                    }
                />
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

    const kycQuery = useQuery({
        queryKey: ["isKyc", address],
        queryFn: async () => {
            if (!address) return null;
            return false;
        },
    });

    const { data: isKyc } = kycQuery;

    const Avatar = () => {
        return (
            <Center>
                <Image
                    alt="ENS Avatar"
                    src={ensAvatar || "/RootFaviconLight.png"}
                    width={"32"}
                    aspectRatio={"1/1"}
                />
            </Center>
        )
    }

    const InfoSnippet = () => {
        return (
            <VStack>
                <Tag
                    variant="solid"
                    colorPalette={isKyc ? "green" : "secondary"}
                    endElement={isKyc ? <FaCheck /> : undefined}
                >
                    {isKyc ? "Đã xác minh" : "Chưa xác minh"}
                </Tag>
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
            <KycArea kycQuery={kycQuery} />
        </VStack>
    );
};