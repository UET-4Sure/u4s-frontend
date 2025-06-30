"use client"

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Box, VStack, Text, HStack, Heading, Image, Container, Center, Flex } from '@chakra-ui/react'
import { usePositions } from '@/hooks/usePositions'
import { Tag } from '@/components/ui/tag'
import { TOKEN_LIST } from '@/app/(dashboard)/(trade)/swap/config'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box);

interface ParsedTitle {
    protocol: string;
    feeTier: string;
    token0: string;
    token1: string;
    lowerPrice: string;
    upperPrice: string;
}

const parsePositionTitle = (title: string): ParsedTitle | null => {
    try {
        // Example: "Uniswap - 0.3% - WETH/USDC - 0.94177<>1.0618"
        const parts = title.split(' - ');
        if (parts.length !== 4) return null;

        const [protocol, feeTier, tokens, priceRange] = parts;
        const [token0, token1] = tokens.split('/');
        const [lowerPrice, upperPrice] = priceRange.split('<>');

        return {
            protocol: 'NolaSwap', // Replace Uniswap with NolaSwap
            feeTier,
            token0,
            token1,
            lowerPrice,
            upperPrice
        };
    } catch {
        return null;
    }
};

const TokenWithLogo = ({ symbol }: { symbol: string }) => {
    const token = TOKEN_LIST.find(t => t.symbol === symbol);
    const [hasError, setHasError] = useState(false);

    return (
        <HStack gap={1}>
            {token?.logoURI && !hasError ? (
                <Box boxSize="20px" rounded="full" overflow="hidden">
                    <Image
                        src={token.logoURI}
                        alt={symbol}
                        w="full"
                        h="full"
                        onError={() => setHasError(true)}
                    />
                </Box>
            ) : (
                <Box w="20px" h="20px" bg="gray.200" rounded="full" />
            )}
            <Text>{symbol}</Text>
        </HStack>
    );
};

export default function PositionsList() {
    const { address } = useAccount()
    const { data: positions, isLoading, error } = usePositions(address)

    const renderContent = () => {
        if (!address) {
            return (
                <Center flex={1}>
                    <Text>Vui lòng kết nối ví để xem vị thế</Text>
                </Center>
            )
        }

        if (isLoading) {
            return (
                <Center flex={1}>
                    <Text>Đang tải vị thế...</Text>
                </Center>
            )
        }

        if (error) {
            return (
                <Center flex={1}>
                    <Text color="red.500">{error.message}</Text>
                </Center>
            )
        }

        if (positions?.length === 0) {
            return (
                <Center h={"full"} flex={1}>
                    <Text color={"fg.muted"}>Không có vị thế nào</Text>
                </Center>
            )
        }

        return (
            <VStack gap={4} width="full">
                {positions?.map((position, index) => {
                    const parsedTitle = position.metadata?.title ? parsePositionTitle(position.metadata.title) : null;

                    return (
                        <MotionBox
                            key={position.tokenId}
                            w="full"
                            bg="bg.subtle"
                            p={"4"}
                            rounded="3xl"
                            shadow="md"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            cursor="pointer"
                            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        >
                            <HStack gap={6} align="start">
                                {position.metadata?.mediaUrl && (
                                    <Box boxSize="100px" rounded="lg" overflow="hidden">
                                        <Image
                                            src={position.metadata.mediaUrl}
                                            alt={position.metadata?.title || `Position #${position.tokenId}`}
                                            objectFit="cover"
                                            w="full"
                                            h="full"
                                        />
                                    </Box>
                                )}
                                <VStack align="start" flex="1" gap={2}>
                                    <VStack align="start" gap={2} width="full">
                                        <HStack justify="space-between" width="full">
                                            <HStack gap={2}>
                                                <Tag colorPalette="primary">
                                                    {parsedTitle?.protocol || 'NolaSwap'}
                                                </Tag>
                                                <Tag colorPalette="secondary">
                                                    NFT #{position.tokenId}
                                                </Tag>
                                                <Tag colorPalette="accent">
                                                    {parsedTitle?.feeTier || '0.3%'}
                                                </Tag>
                                            </HStack>
                                        </HStack>

                                        {parsedTitle && (
                                            <>
                                                <HStack gap={2}>
                                                    <TokenWithLogo symbol={parsedTitle.token0} />
                                                    <Text>/</Text>
                                                    <TokenWithLogo symbol={parsedTitle.token1} />
                                                </HStack>
                                                <HStack>
                                                    <Text fontSize="sm" color="gray.600">Price Range:</Text>
                                                    <Text fontSize="sm">
                                                        {parsedTitle.lowerPrice} → {parsedTitle.upperPrice}
                                                    </Text>
                                                </HStack>
                                            </>
                                        )}
                                    </VStack>
                                </VStack>
                            </HStack>
                        </MotionBox>
                    );
                })}
            </VStack>
        );
    };

    return (
        <Container maxW="container.xl" py={8}
        >
            <VStack gap={6} align="stretch">
                <Box>
                    <Heading size="4xl">Vị thế của bạn</Heading>
                    <Text color="fg">Xem và quản lý vị thế của bạn</Text>
                </Box>
                <Box flex="1" w="full" maxW="container.lg" mx="auto">
                    {renderContent()}
                </Box>
            </VStack>
        </Container>
    );
} 