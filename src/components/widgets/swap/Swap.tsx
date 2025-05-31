"use client";

import { DialogRootProps, HStack, Input, InputProps, StackProps, Text, VStack } from "@chakra-ui/react";
import { NumericFormat } from 'react-number-format';
import { SwapState, Token } from "../type";
import { useSwapQuote, useSwapState, useTokenBalance } from "./hooks";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectTokenDialog } from "../components/SelectTokenDialog";


type BackgroundStyle = 'default' | 'vietnamese-flag';

interface SwapInputProps extends StackProps {
    label: string;
    token: Token | null;
    amount: string;
    balance?: string;
    tokenList?: Token[];
    onAmountChange: (amount: string) => void;
    onTokenSelect: (token: Token) => void;
    onMaxClick?: () => void;
    disabled?: boolean;
    readOnly?: boolean;

    wrapperProps?: StackProps;
    inputProps?: InputProps;
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

    wrapperProps,
    inputProps,
    ...props
}) => {
    const [selectedToken, setSelectedToken] = useState<Token | null>(token);

    const sampleTokens: Token[] = [
        {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            symbol: 'WETH',
            name: 'Wrapped Ether',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
            balance: '1.2345',
            price: '2385.56',
        },
        {
            address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            symbol: 'UNI',
            name: 'Uniswap',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
            balance: '200',
            price: '6.82',
        },
        {
            address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            symbol: 'LINK',
            name: 'Chainlink',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
            balance: '100',
            price: '16.20',
        },
        {
            address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
            symbol: 'AAVE',
            name: 'Aave',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
            balance: '5',
            price: '199.91',
        },
        {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
            balance: '5000',
            price: '1.00',
        },
    ];
    const handleTokenSelect = useCallback((token: Token) => {
        onTokenSelect(token);
        setSelectedToken(token);
    }, [onTokenSelect]);

    const handleImportToken = async (address: string): Promise<Token> => {
        // Simulate token import
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            address,
            symbol: 'CUSTOM',
            name: 'Custom Token',
            decimals: 18,
        };
    };

    return (
        <VStack
            w={"full"}
            aspectRatio={"3/1"}
            maxH={"36"}
            rounded={"3xl"}
            bg={"bg.subtle"}
            p={"4"}
            shadow={"md"}
            // bgImage={backgroundStyle === 'vietnamese-flag' ? "radial-gradient(100% 100% at 50.1% 0%, #FFA103 0%, #BC2D29 41.35%, #450E14 100%)" : undefined}
            {...wrapperProps}
        >
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
                    focusRing={"none"}
                    p={0}
                    color={inputProps?.color || "fg"}
                    _placeholder={{ color: inputProps?._placeholder?.color || "fg.muted" }}
                    fontWeight={"semibold"}
                    fontSize={"2xl"}
                />
                <SelectTokenDialog
                    title={selectedToken?.symbol}
                    selectedToken={selectedToken}
                    onSelectToken={handleTokenSelect}
                    tokenList={tokenList.length > 0 ? tokenList : sampleTokens}
                />
            </HStack>
        </VStack>
    );
}

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
                label="Bán"
                token={swapState.fromToken}
                amount={swapState.fromAmount}
                balance={fromBalance}
                onAmountChange={swapState.setFromAmount}
                tokenList={tokenList}
                onTokenSelect={() => onTokenSelect?.('from')}
                onMaxClick={handleMaxClick}
                disabled={swapState.isLoading}
            />
            <SwapInput
                label="Mua"
                token={swapState.toToken}
                amount={swapState.toAmount}
                balance={toBalance}
                onAmountChange={swapState.setToAmount}
                tokenList={tokenList}
                onTokenSelect={() => onTokenSelect?.('to')}
                readOnly
                disabled={true}

                wrapperProps={{
                    bgImage: "radial-gradient(100% 100% at 50.1% 0%, #FFA103 0%, #BC2D29 41.35%, #450E14 100%)",
                }}

                inputProps={{
                    color: "primary",
                    _placeholder: { color: "primary" },
                }}
            />
        </VStack>
    );
}