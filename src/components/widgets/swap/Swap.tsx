"use client";

import { DialogRootProps, HStack, Input, InputProps, StackProps, Text, VStack } from "@chakra-ui/react";
import { NumericFormat } from 'react-number-format';
import { SwapState, Token } from "../type";
import { useSwapQuote, useSwapState, useTokenBalance } from "./hooks";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SwapWidgetProps extends StackProps {
    onSwap?: (swapData: SwapState) => Promise<void>;
    onTokenSelect?: (type: 'from' | 'to') => void;
    showPriceImpact?: boolean;
    showSlippage?: boolean;

    // Token lists
    tokenList?: Token[];
    defaultFromToken?: Token;
    defaultToToken?: Token;

    // User context
    userAddress?: string;
    onStateChange?: (state: SwapState) => void;
}
export const SwapWidget: React.FC<SwapWidgetProps> = ({ children,
    onSwap,
    onTokenSelect,
    showPriceImpact = true,
    showSlippage = true,
    tokenList = [],
    defaultFromToken = null,
    defaultToToken = null,
    userAddress,
    onStateChange,
    ...props
}) => {
    const swapState = useSwapState({
        fromToken: defaultFromToken || null,
        toToken: defaultToToken || null,
    });

    const { data: fromBalance } = useTokenBalance(swapState.fromToken, userAddress);
    const { data: toBalance } = useTokenBalance(swapState.toToken, userAddress);

    const { data: quote, isLoading: isQuoteLoading } = useSwapQuote({
        fromToken: swapState.fromToken,
        toToken: swapState.toToken,
        fromAmount: swapState.fromAmount,
        onQuoteUpdate: (quote) => {
            if (quote) {
                swapState.setToAmount(quote.toAmount);
            }
        },
    });

    const handleSwap = useCallback(async () => {
        if (!swapState.fromToken || !swapState.toToken || !swapState.fromAmount) {
            return;
        }

        try {
            swapState.updateState({ isLoading: true, error: null });
            await onSwap?.(swapState);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Swap failed';
            swapState.updateState({ error: errorMsg });

        } finally {
            swapState.updateState({ isLoading: false });
        }
    }, [swapState, onSwap]);

    const handleMaxClick = useCallback(() => {
        if (fromBalance) {
            swapState.setFromAmount(fromBalance);
        }
    }, [fromBalance, swapState]);

    useEffect(() => {
        onStateChange?.(swapState);
    }, [swapState, onStateChange]);


    return (
        <VStack {...props}>
            <SwapInput
                label="From"
                token={swapState.fromToken}
                amount={swapState.fromAmount}
                balance={fromBalance}
                onAmountChange={swapState.setFromAmount}
                tokenList={tokenList}
                onTokenSelect={() => onTokenSelect?.('from')}
                onMaxClick={handleMaxClick}
                disabled={swapState.isLoading}
            />
        </VStack>
    );
}

interface SwapInputProps extends StackProps {
    label: string;
    token: Token | null;
    amount: string;
    balance?: string;
    tokenList?: Token[];
    onAmountChange: (amount: string) => void;
    onTokenSelect: () => void;
    onMaxClick?: () => void;
    disabled?: boolean;
    readOnly?: boolean;
}
export const SwapInput: React.FC<SwapInputProps> = ({ children,
    label,
    token,
    amount,
    balance,
    tokenList = [],
    onAmountChange,
    onTokenSelect,
    onMaxClick,
    disabled = false,
    readOnly = false,
    ...props
}) => {

    return (
        <VStack>
            <HStack w={"full"}>
                <Text fontSize={"md"} fontWeight={"medium"} color={"fg.muted"}>
                    {label}
                </Text>
            </HStack>
            <HStack w={"full"}>
                <NumericFormat
                    inputMode="decimal"
                    value={amount}
                    onValueChange={(values) => onAmountChange(values.value)}
                    thousandSeparator
                    allowNegative={false}
                    decimalScale={token?.decimals || 18}
                    allowLeadingZeros={false}
                    placeholder="0.0"
                    disabled={disabled}
                    readOnly={readOnly}

                    // UI
                    customInput={Input}
                    bg={"transparent"}
                    border={"none"}
                    p={0}
                    focusRing={"none"}
                    color={"fg"}
                    fontWeight={"semibold"}
                    fontSize={"2xl"}
                />
            </HStack>
        </VStack>
    );
}