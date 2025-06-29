"use client";

import { useState, useCallback } from "react";
import { VStack, Text } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { TOKEN_ADDRESSES } from "@/app/(dashboard)/(trade)/swap/constants";
import { ethers } from "ethers";
import ERC20_MINTABLE_ABI from "@/abis/ERC20Mintable.json";
import { useAccount, useWriteContract } from "wagmi";
import { ConnectWalletButton } from "@/components/global/wallet";
import { toaster } from "@/components/ui/toaster";

const TOKENS = [
    { symbol: "WETH", address: TOKEN_ADDRESSES.WETH },
    { symbol: "USDC", address: TOKEN_ADDRESSES.USDC },
    { symbol: "WBTC", address: TOKEN_ADDRESSES.WBTC },
    { symbol: "LINK", address: TOKEN_ADDRESSES.LINK },
    { symbol: "EUR", address: TOKEN_ADDRESSES.EUR },
];

const MINT_AMOUNT = "100";

export const FaucetWidget = () => {
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

    const handleMint = useCallback(async (tokenAddress: string, symbol: string) => {
        if (!address) {
            toaster.error({
                title: "Mint Error",
                description: "Please connect your wallet first.",
            });
            return;
        }

        try {
            setLoading(prev => ({ ...prev, [tokenAddress]: true }));

            // Get token decimals first
            const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_MINTABLE_ABI.abi, provider);
            const decimals = await tokenContract.decimals();
            
            // Execute mint transaction
            await writeContractAsync({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_MINTABLE_ABI.abi,
                functionName: "mint",
                args: [address, ethers.utils.parseUnits(MINT_AMOUNT, decimals)],
            });

            toaster.success({
                title: "Success",
                description: `Successfully minted ${MINT_AMOUNT} ${symbol} tokens`,
            });
        } catch (error) {
            console.error("Mint error:", error);
            toaster.error({
                title: "Mint Error",
                description: `Failed to mint ${symbol} tokens. Please try again.`,
            });
        } finally {
            setLoading(prev => ({ ...prev, [tokenAddress]: false }));
        }
    }, [address, writeContractAsync]);

    if (!isConnected) {
        return (
            <VStack gap={4}>
                <Text>Connect your wallet to mint tokens</Text>
                <ConnectWalletButton />
            </VStack>
        );
    }

    return (
        <VStack gap={4}>
            <Text>Click on any token to mint 100 tokens to your wallet</Text>
            {TOKENS.map(({ symbol, address }) => (
                <Button
                    key={address}
                    className="w-full"
                    onClick={() => handleMint(address, symbol)}
                    loading={loading[address]}
                    loadingText={`Minting ${symbol}...`}
                >
                    Mint {MINT_AMOUNT} {symbol}
                </Button>
            ))}
        </VStack>
    );
}; 