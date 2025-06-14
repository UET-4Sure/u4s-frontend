"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Center, DialogRootProps, HStack, IconButton, IconButtonProps, Input, InputProps, StackProps, Text, TextProps, VStack } from "@chakra-ui/react";
import { NumericFormat } from 'react-number-format';
import { CgArrowsExchangeAltV } from "react-icons/cg";
import numberal from "numeral";

import { SwapState, Token } from "../type";
import { useSwapQuote, useSwapState, useTokenBalance, useTokenListBalances, useTokenListPrices } from "./hooks";
import { SelectTokenDialog, SelectTokenDialogProps } from "../components/SelectTokenDialog";
import { motion, MotionProps, useCycle } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/global/wallet";

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
    const sampleTokens: Token[] = [
        {
            address: '0x342d6127609A5Ad63C93E10cb73b7d9dE9bC43Aa',
            symbol: 'WETH',
            name: 'Wrapped Ether',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
            balance: '1.2345',
            price: '2385.56',
        },
        {
            address: '0x0ff5065E79c051c3D4C790BC9e8ebc9b4E56bbcc',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
            balance: '200',
            price: '1.00',
        },
        {
            address: '0x12Df3798C30532c068306372d24c9f2f451676e9',
            symbol: 'WBTC',
            name: 'Wrapped Bitcoin',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
            balance: '100',
            price: '108120.01',
        },
        {
            address: '0x88B42E9E9E769F86ab499D8cb111fcb6f691F70E',
            symbol: 'LINK',
            name: 'Chainlink',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
            balance: '5',
            price: '14.12',
        },
        {
            address: '0x336d87aEdF99d5Fb4F07132C8DbE4bea4c766eAc',
            symbol: 'EUR',
            name: 'Euro',
            decimals: 18,
            logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png',
            balance: '5000',
            price: '1.15',
        },
    ];

    const { data: tokenBalances } = useTokenListBalances(
        tokenList.length > 0 ? tokenList : sampleTokens,
        userAddress
    );

    const { data: tokenPrices } = useTokenListPrices(
        tokenList.length > 0 ? tokenList : sampleTokens
    );

    const tokensWithBalancesAndPrices = useMemo(() => {
        const tokens = tokenList.length > 0 ? tokenList : sampleTokens;
        return tokens.map(token => ({
            ...token,
            balance: tokenBalances?.[token.address.toLowerCase()] || '0',
            price: tokenPrices?.[token.address.toLowerCase()] || '0'
        }));
    }, [tokenList, sampleTokens, tokenBalances, tokenPrices]);

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
                    title={token?.symbol}
                    selectedToken={token}
                    tokenList={tokensWithBalancesAndPrices}
                    onSelectToken={handleTokenSelect}
                    onImportToken={handleImportToken}
                    {...props.selectTokenDialogProps}
                />
            </HStack>
            <HStack w={"full"} justify={"space-between"}>
                <Text fontSize={"sm"} {...balanceProps}>
                    Balance: {balance ? numberal(balance).format('0,0.0000') : 0} {token?.symbol}
                </Text>
                {token && tokenPrices?.[token.address.toLowerCase()] && (
                    <Text fontSize={"sm"} {...balanceProps}>
                        ${numberal(tokenPrices[token.address.toLowerCase()]).format('0,0.00')}
                    </Text>
                )}
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

    const handleTokenSelect = useCallback((type: 'from' | 'to', token: Token) => {
        type === 'from' ? swapState.setFromToken(token) : swapState.setToToken(token);
        onTokenSelect?.(type, token);
    }, [onTokenSelect]);

    const handleMaxClick = useCallback(() => {
        if (fromBalance) {
            swapState.setFromAmount(fromBalance);
        }
    }, [fromBalance, swapState]);

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
                    disabled={swapState.isLoading}
                    userAddress={userAddress}

                    balanceProps={{
                        color: "fg.muted",
                    }}
                    {...swapInputProps}
                />
                <Center position={"absolute"} top={"50%"} left={"50%"} transform={"translate(-50%, -50%)"} zIndex={1}>
                    <SwitchButton
                        onClick={() => {
                            swapState.swapTokens()
                            console.log("Swapped tokens:", swapState.fromToken, "and", swapState.toToken);
                        }}
                        loading={swapState.isLoading}
                        {...switchButtonProps}
                    />
                </Center>
                <SwapInput
                    label="Mua"
                    token={swapState.toToken}
                    amount={swapState.toAmount}
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
                onClick={handleSwap}
                {...swapButtonProps}
            />
        </VStack>
    );
}