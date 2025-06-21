"use client";

import { VStack, Center } from "@chakra-ui/react";
import { Token } from "../type";
import { SwapInput } from "../swap/Swap";
import { useSwapState } from "../swap/hooks";
import { useTokenBalance } from "../swap/hooks";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/global/wallet";

interface PositionWidgetProps {
    defaultFromToken?: Token;
    defaultToToken?: Token;
    tokenList?: Token[];
    userAddress?: string;
    onCreatePosition?: (fromToken: Token, toToken: Token, fromAmount: string, toAmount: string) => Promise<void>;
}

export const PositionWidget: React.FC<PositionWidgetProps> = ({
    defaultFromToken = null,
    defaultToToken = null,
    tokenList = [],
    userAddress,
    onCreatePosition,
}) => {
    const swapState = useSwapState({
        fromToken: defaultFromToken || null,
        toToken: defaultToToken || null,
    });

    const { data: fromBalance } = useTokenBalance(swapState.fromToken, userAddress);
    const { data: toBalance } = useTokenBalance(swapState.toToken, userAddress);
    const { isConnected } = useAccount();

    const isDisabled = !swapState.fromToken || !swapState.toToken || !swapState.fromAmount || !swapState.toAmount;

    const handleCreatePosition = async () => {
        if (!swapState.fromToken || !swapState.toToken || !swapState.fromAmount || !swapState.toAmount) return;
        await onCreatePosition?.(swapState.fromToken, swapState.toToken, swapState.fromAmount, swapState.toAmount);
    };

    return (
        <VStack gap={"2"}>
            <VStack gap={"2"} pos={"relative"}>
                <SwapInput
                    label="Token 0"
                    token={swapState.fromToken}
                    amount={swapState.fromAmount}
                    balance={fromBalance}
                    onAmountChange={swapState.setFromAmount}
                    tokenList={tokenList}
                    onTokenSelect={(token) => swapState.setFromToken(token)}
                    disabled={!swapState.fromToken}
                    userAddress={userAddress}
                    balanceProps={{
                        color: "fg.muted",
                    }}
                />
                <SwapInput
                    label="Token 1"
                    token={swapState.toToken}
                    amount={swapState.toAmount}
                    balance={toBalance}
                    onAmountChange={swapState.setToAmount}
                    tokenList={tokenList}
                    onTokenSelect={(token) => swapState.setToToken(token)}
                    disabled={!swapState.toToken}
                    userAddress={userAddress}
                    wrapperProps={{
                        bgImage: "radial-gradient(100% 100% at 50.1% 0%, #FFA103 0%, #BC2D29 41.35%, #450E14 100%)",
                    }}
                    inputProps={{
                        color: "primary.solid",
                        _placeholder: { color: "primary.solid" },
                    }}
                    balanceProps={{
                        color: "primary.muted",
                    }}
                    selectTokenDialogProps={{
                        triggerProps: {
                            colorPalette: "primary"
                        }
                    }}
                />
            </VStack>
            {!isConnected ? (
                <ConnectWalletButton colorPalette={"primary"} w={"full"} size={"lg"} />
            ) : (
                <Button
                    variant={"solid"}
                    w={"full"}
                    size={"lg"}
                    disabled={isDisabled}
                    onClick={handleCreatePosition}
                >
                    Tạo vị thế
                </Button>
            )}
        </VStack>
    );
}; 