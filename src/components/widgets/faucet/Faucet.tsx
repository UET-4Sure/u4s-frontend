"use client";

import { useState, useCallback } from "react";
import { VStack, Text, HStack, Box, chakra, Grid } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { TOKEN_ADDRESSES } from "@/app/(dashboard)/(trade)/swap/constants";
import { ethers } from "ethers";
import ERC20_MINTABLE_ABI from "@/abis/ERC20Mintable.json";
import { useAccount, useWriteContract } from "wagmi";
import { ConnectWalletButton } from "@/components/global/wallet";
import { toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI: string;
}

const MINT_AMOUNT = "100";

const TOKENS: Token[] = [
    {
        address: TOKEN_ADDRESSES.WETH,
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    },
    {
        address: TOKEN_ADDRESSES.USDC,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    },
    {
        address: TOKEN_ADDRESSES.WBTC,
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    },
    {
        address: TOKEN_ADDRESSES.LINK,
        symbol: 'LINK',
        name: 'Chainlink',
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
    },
    {
        address: TOKEN_ADDRESSES.EUR,
        symbol: 'EUR',
        name: 'Euro',
        decimals: 18,
        logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png',
    }
];

export const FaucetWidget = () => {
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

    const handleMint = useCallback(async (token: Token) => {
        if (!address) {
            toaster.error({
                title: "Lỗi",
                description: "Kết nối ví trước.",
            });
            return;
        }

        try {
            setLoading(prev => ({ ...prev, [token.address]: true }));

            // Get token decimals first
            const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const tokenContract = new ethers.Contract(token.address, ERC20_MINTABLE_ABI.abi, provider);
            const decimals = await tokenContract.decimals();

            // Execute mint transaction
            await writeContractAsync({
                address: token.address as `0x${string}`,
                abi: ERC20_MINTABLE_ABI.abi,
                functionName: "mint",
                args: [address, ethers.utils.parseUnits(MINT_AMOUNT, decimals)],
            });

            toaster.success({
                title: "Thành công",
                description: `Mint ${MINT_AMOUNT} ${token.symbol} thành công`,
            });
        } catch (error) {
            console.error("Mint error:", error);
            toaster.error({
                title: "Lỗi",
                description: `Mint ${token.symbol} thất bại.`,
            });
        } finally {
            setLoading(prev => ({ ...prev, [token.address]: false }));
        }
    }, [address, writeContractAsync]);

    if (!isConnected) {
        return (
            <VStack gap={6} p={6} bg="bg.subtle" rounded="2xl" shadow="md">
                <Text fontSize="lg" textAlign="center" color="fg.subtle">
                    Kết nối ví để mint token
                </Text>
                <ConnectWalletButton />
            </VStack>
        );
    }

    return (
        <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
            gap={4}
            w="full"
        >
            {TOKENS.map((token, index) => (
                <MotionBox
                    key={token.address}
                    bg="bg.subtle"
                    p={"4"}
                    rounded="2xl"
                    shadow="md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1, y: 0,
                        transition: { duration: 0.25, delay: index * 0.1 }
                    }}
                    // spring animation
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.02 }}
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                >
                    <VStack gap={3}>
                        <HStack gap={3} w="full">
                            <Box
                                w="10"
                                h="10"
                                rounded="full"
                                overflow="hidden"
                                bg="bg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <chakra.img
                                    src={token.logoURI}
                                    alt={token.symbol}
                                    w="8"
                                    h="8"
                                    objectFit="cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/brand/logo.svg";
                                    }}
                                />
                            </Box>
                            <VStack align="start" gap={0} flex={1}>
                                <Text fontSize="md" fontWeight="semibold" color="fg">
                                    {token.symbol}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="fg.subtle"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                >
                                    {token.name}
                                </Text>
                            </VStack>
                        </HStack>

                        <Button
                            w="full"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleMint(token)}
                            loading={loading[token.address]}
                            loadingText={`Mint ${token.symbol}...`}
                        >
                            Mint {MINT_AMOUNT} {token.symbol}
                        </Button>
                    </VStack>
                </MotionBox>
            ))
            }
        </Grid >
    );
}; 