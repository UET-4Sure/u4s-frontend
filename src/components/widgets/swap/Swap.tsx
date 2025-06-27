"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Center, DialogRootProps, HStack, IconButton, IconButtonProps, Input, InputProps, StackProps, Text, TextProps, VStack } from "@chakra-ui/react";
import { NumericFormat } from 'react-number-format';
import { CgArrowsExchangeAltV } from "react-icons/cg";
import numeral from "numeral";

import { SwapState, Token } from "../type";
import { useSwapQuote, useSwapState, useTokenBalance, useTokenListBalances, useTokenListPrices } from "./hooks";
import { SelectTokenDialog, SelectTokenDialogProps } from "../components/SelectTokenDialog";
import { motion, MotionProps, useCycle } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/global/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MotionIconButton = motion.create(IconButton);

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
    userAddress?: string;

    wrapperProps?: StackProps;
    inputProps?: InputProps;
    balanceProps?: TextProps;
    selectTokenDialogProps?: Omit<SelectTokenDialogProps, 'onSelectToken' | 'onImportToken' | 'tokenList' | 'selectedToken' | 'children'> & Omit<DialogRootProps, 'children'> & { children?: React.ReactNode };
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
    userAddress,

    wrapperProps,
    inputProps,
    balanceProps,
    ...props
}) => {

    const { data: tokenBalances } = useTokenListBalances(
        tokenList.length > 0 ? tokenList : [],
        userAddress
    );

    const { data: tokenPrices } = useTokenListPrices(
        tokenList.length > 0 ? tokenList : []
    );

    const tokensWithBalancesAndPrices = useMemo(() => {
        const tokens = tokenList.length > 0 ? tokenList : [];
        return tokens.map(token => ({
            ...token,
            balance: tokenBalances?.[token.address.toLowerCase()] || '0',
            price: tokenPrices?.[token.address.toLowerCase()] || '0'
        }));
    }, [tokenList, tokenBalances, tokenPrices]);

    const handleTokenSelect = useCallback((token: Token) => {
        onTokenSelect(token);
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
            h={"36"}
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
                    value={numeral(amount).format('0,0.[00000]')}
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
                    title={token?.symbol}
                    selectedToken={token}
                    tokenList={tokensWithBalancesAndPrices}
                    onSelectToken={handleTokenSelect}
                    onImportToken={handleImportToken}
                    {...props.selectTokenDialogProps}
                />
            </HStack>
            <HStack w={"full"} justify={"space-between"}>
                {token && tokenPrices?.[token.address.toLowerCase()] && (
                    <Text fontSize={"sm"} {...balanceProps}>
                        ${numeral(Number(tokenPrices[token.address.toLowerCase()]) * Number(amount)).format('0,0.00')}
                    </Text>
                )}
                <Text fontSize={"sm"} {...balanceProps}>
                    Balance: {numeral(balance).format('0,0.[0000')} {token?.symbol}
                </Text>
            </HStack>
        </VStack>
    );
}

interface SwitchButtonProps extends Omit<IconButtonProps, keyof MotionProps> {
}
export const SwitchButton: React.FC<SwitchButtonProps & MotionProps> = ({ onClick, ...props }) => {
    const [rotate, cycleRotate] = useCycle(0, 180);

    const handleClick = (e: any) => {
        cycleRotate();
        onClick?.(e);
    };

    return (
        <MotionIconButton
            variant={"solid"}
            bg={"secondary"}
            color={"primary"}
            size={"md"}
            rounded={"full"}
            border={"4px solid"}
            borderColor={"bg"}
            _icon={{ scale: 1.25 }}

            whileTap={{
                scale: 0.9,
                rotate: 180,
            }}
            animate={{ rotate }}
            transition={{ type: "tween", duration: 0.1, ease: "easeInOut" }}
            onClick={handleClick}
            {...props}
        >
            <CgArrowsExchangeAltV />
        </MotionIconButton>
    );
}

interface SwapButtonProps extends ButtonProps {
    label?: string;
}
export const SwapButton: React.FC<SwapButtonProps> = ({ children, label, ...props }) => {
    // get balance and price impact from context or props if needed
    const { isConnected } = useAccount();

    const predefinedLabel = useMemo(() => {
        if (!isConnected) {
            return "Kết nối";
        }
        return "Trao đổi";
    }, [isConnected]);

    const buttonStyle = useMemo(() => {
        return {
        };
    }, [isConnected]);

    if (!isConnected) {
        return (
            <ConnectWalletButton colorPalette={"primary"} w={"full"} size={"lg"} />
        )
    }

    return (
        <Button
            variant={"solid"}
            w={"full"}
            size={"lg"}
            {...props}
            {...buttonStyle}
        >
            {predefinedLabel}
        </Button>
    );
}

interface SwapWidgetProps extends StackProps {
    onSwap?: (swapData: SwapState) => Promise<void>;
    onTokenSelect?: (type: 'from' | 'to', token: Token) => void;
    showPriceImpact?: boolean;
    showSlippage?: boolean;

    // Token lists
    tokenList?: Token[];
    defaultFromToken?: Token;
    defaultToToken?: Token;

    // User context
    userAddress?: string;
    onStateChange?: (state: SwapState) => void;

    // Props
    swapButtonProps?: SwapButtonProps;
    swapInputProps?: SwapInputProps;
    switchButtonProps?: SwitchButtonProps;
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

    swapButtonProps,
    swapInputProps,
    switchButtonProps,
    ...props
}) => {
    const swapState = useSwapState({
        fromToken: defaultFromToken || null,
        toToken: defaultToToken || null,
    });
    const queryClient = useQueryClient();
    const { data: fromBalance } = useTokenBalance(swapState.fromToken, userAddress);
    const { data: toBalance } = useTokenBalance(swapState.toToken, userAddress);

    const { data: quote, isLoading: isQuoteLoading } = useSwapQuote({
        fromToken: swapState.fromToken,
        toToken: swapState.toToken,
        fromAmount: swapState.fromAmount,
        onQuoteUpdate: (quote) => {
            if (quote) {
                const formattedAmount = parseFloat(quote.toAmount).toFixed(6);
                swapState.setToAmount(formattedAmount);
            }
        },
    });

    const { mutate: handleSwap } = useMutation({
        mutationKey: ['swap', swapState.fromToken?.address, swapState.toToken?.address],
        mutationFn: async () => {
            if (!swapState.fromToken || !swapState.toToken || !swapState.fromAmount) {
                throw new Error("Missing swap data");
            }

            // Optional: optimistic update
            swapState.updateState({ isLoading: true, error: null });

            await onSwap?.(swapState); // thực hiện swap

            return {
                fromToken: swapState.fromToken.address,
                toToken: swapState.toToken.address,
            };
        },
        onSuccess: ({ fromToken, toToken }) => {
            // Reset amount sau swap
            swapState.updateState({ fromAmount: '', toAmount: '' });

            // Invalidate balance
            queryClient.invalidateQueries({ queryKey: ['token-balance', fromToken, userAddress] });
            queryClient.invalidateQueries({ queryKey: ['token-balance', toToken, userAddress] });

            // Optionally invalidate price
            queryClient.invalidateQueries({ queryKey: ['token-price', fromToken, toToken] });
        },
        onError: (error) => {
            const errorMsg = error instanceof Error ? error.message : 'Swap failed';
            swapState.updateState({ error: errorMsg });
        },
        onSettled: () => {
            swapState.updateState({ isLoading: false });
        }
    });

    const handleTokenSelect = useCallback((type: 'from' | 'to', selectedToken: Token) => {
        const { fromToken, toToken } = swapState;

        const isSameAsOther =
            (type === 'from' && selectedToken.address === toToken?.address) ||
            (type === 'to' && selectedToken.address === fromToken?.address);

        if (isSameAsOther) {
            swapState.switchTokens();
            onTokenSelect?.(type, selectedToken);
            return;
        }

        const isNoChange =
            (type === 'from' && selectedToken.address === fromToken?.address) ||
            (type === 'to' && selectedToken.address === toToken?.address);

        if (isNoChange) {
            return;
        }

        if (type === 'from') {
            swapState.setFromToken(selectedToken);
        } else {
            swapState.setToToken(selectedToken);
        }

        onTokenSelect?.(type, selectedToken);
    }, [swapState, onTokenSelect]);

    const handleMaxClick = useCallback(() => {
        if (fromBalance) {
            swapState.setFromAmount(fromBalance);
        }
    }, [fromBalance, swapState]);

    const labelLoading = useMemo(() => {
        if (isQuoteLoading) {
            return "Đang ước lượng giá...";
        }

        if (swapState.isLoading) {
            return "Đang trao đổi...";
        }

        return "Trao đổi";
    }, [isQuoteLoading, swapState.isLoading]);

    const isDisabled = useMemo(() => {
        return swapState.isLoading || !swapState.fromToken || !swapState.toToken || !swapState.fromAmount;
    }, [swapState]);

    useEffect(() => {
        onStateChange?.(swapState);
    }, [swapState, onStateChange]);


    return (
        <VStack gap={"2"} {...props}>
            <VStack gap={"2"} pos={"relative"}>
                <SwapInput
                    label="Bán"
                    token={swapState.fromToken}
                    amount={swapState.fromAmount}
                    balance={fromBalance}
                    onAmountChange={swapState.setFromAmount}
                    tokenList={tokenList}
                    onTokenSelect={(token) => handleTokenSelect('from', token)}
                    onMaxClick={handleMaxClick}
                    disabled={swapState.isLoading || !swapState.fromToken}
                    userAddress={userAddress}

                    balanceProps={{
                        color: "fg.muted",
                    }}
                    {...swapInputProps}
                />
                <Center position={"absolute"} top={"50%"} left={"50%"} transform={"translate(-50%, -50%)"} zIndex={1}>
                    <SwitchButton
                        onClick={() => {
                            swapState.switchTokens()
                        }}
                        {...switchButtonProps}
                    />
                </Center>
                <SwapInput
                    label="Mua"
                    token={swapState.toToken}
                    amount={quote?.toAmount || swapState.toAmount}
                    balance={toBalance}
                    onAmountChange={swapState.setToAmount}
                    tokenList={tokenList}
                    onTokenSelect={(token) => handleTokenSelect('to', token)}
                    readOnly
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
            <SwapButton
                loadingText={labelLoading}
                loading={swapState.isLoading || isQuoteLoading}
                disabled={isDisabled}
                onClick={() => {
                    handleSwap();
                }}
                {...swapButtonProps}
            />
        </VStack>
    );
}