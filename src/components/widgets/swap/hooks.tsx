import { useState, useCallback, useMemo } from 'react';
import { SwapState, SwapQuote, Token } from '../type';
import { debounce } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { quoteAmountOut } from '@/script/QuoteAmountOut';
import { queryBalance } from '@/script/QueryBalance';
import { queryOraclePrice } from '@/script/QueryOraclePrice';

export const useSwapState = (initialState?: Partial<SwapState>) => {
    const [state, setState] = useState<SwapState>({
        fromToken: null,
        toToken: null,
        fromAmount: '',
        toAmount: '',
        slippage: 0.5,
        isLoading: false,
        error: null,
        ...initialState,
    });

    const updateState = useCallback((updates: Partial<SwapState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const setFromToken = useCallback((token: Token | null) => {
        setState(prev => ({ ...prev, fromToken: token, fromAmount: '', toAmount: '' }));
    }, []);

    const setToToken = useCallback((token: Token | null) => {
        setState(prev => ({ ...prev, toToken: token, fromAmount: '', toAmount: '' }));
    }, []);

    const setFromAmount = useCallback((amount: string) => {
        setState(prev => ({ ...prev, fromAmount: amount }));
    }, []);

    const setToAmount = useCallback((amount: string) => {
        setState(prev => ({ ...prev, toAmount: amount }));
    }, []);

    const switchTokens = useCallback(() => {
        setState(prev => ({
            ...prev,
            fromToken: prev.toToken,
            toToken: prev.fromToken,
            fromAmount: prev.toAmount,
            toAmount: prev.fromAmount,
        }));
    }, []);

    const reset = useCallback(() => {
        setState(prev => ({
            ...prev,
            fromAmount: '',
            toAmount: '',
            error: null,
        }));
    }, []);

    return {
        ...state,
        updateState,
        setFromToken,
        setToToken,
        setFromAmount,
        setToAmount,
        switchTokens,
        reset,
    };
};

interface UseSwapQuoteProps {
    fromToken: Token | null;
    toToken: Token | null;
    fromAmount: string;
    onQuoteUpdate?: (quote: SwapQuote | null) => void;
}

export const useSwapQuote = ({
    fromToken,
    toToken,
    fromAmount,
    onQuoteUpdate,
}: UseSwapQuoteProps) => {
    const enabled =
        !!fromToken && !!toToken && !!fromAmount && parseFloat(fromAmount) > 0;

    const debouncedAmount = useMemo(() => {
        const controller = { value: fromAmount };
        const debounced = debounce(() => controller.value, 500);
        debounced();
        return controller.value;
    }, [fromAmount]);

    return useQuery({
        queryKey: ['swap-quote', fromToken?.address, toToken?.address, debouncedAmount],
        queryFn: async (): Promise<SwapQuote> => {
            if (!fromToken || !toToken) {
                throw new Error('Missing tokens');
            }
            // console.log(fromToken.address, toToken.address, debouncedAmount);
            const amountOut = await quoteAmountOut(
                fromToken.address,
                toToken.address,
                parseFloat(debouncedAmount)
            );

            const quote: SwapQuote = {
                fromAmount: debouncedAmount,
                toAmount: amountOut.toString(),
                priceImpact: 0, // This would need to be calculated
                fee: '0', // This would need to be fetched from the pool
                route: [], // This would need to be determined
            };

            if (onQuoteUpdate) {
                onQuoteUpdate(quote);
            }

            return quote;
        },
        enabled,
        staleTime: 30_000, // 30 seconds
    });
};

export const useTokenBalance = (token: Token | null, userAddress?: string) => {
    return useQuery({
        queryKey: ['token-balance', token?.address, userAddress],
        queryFn: async (): Promise<string> => {
            if (!token || !userAddress) {
                console.log('Missing token or userAddress:', { token, userAddress });
                return '0';
            }

            try {
                const balance = await queryBalance(token.address, userAddress);
                console.log('Balance fetched:', { token: token.symbol, userAddress, balance });
                return balance;
            } catch (error) {
                console.error('Failed to fetch balance:', error);
                return '0';
            }
        },
        enabled: !!token && !!userAddress,
        staleTime: 30_000, // 30 seconds
        refetchOnWindowFocus: false,
    });
};

export const useTokenListBalances = (tokens: Token[], userAddress?: string) => {
    return useQuery({
        queryKey: ['token-list-balances', tokens.map(t => t.address), userAddress],
        queryFn: async (): Promise<{ [address: string]: string }> => {
            if (!userAddress) {
                console.log('No user address provided for token list balances');
                return {};
            }

            const balances: { [address: string]: string } = {};

            try {
                // Query all token balances in parallel
                const promises = tokens.map(async (token) => {
                    try {
                        const balance = await queryBalance(token.address, userAddress);
                        balances[token.address.toLowerCase()] = balance;
                    } catch (error) {
                        console.error(`Failed to fetch balance for token ${token.symbol}:`, error);
                        balances[token.address.toLowerCase()] = '0';
                    }
                });

                await Promise.all(promises);
                console.log('Token list balances fetched:', balances);
                return balances;
            } catch (error) {
                console.error('Failed to fetch token list balances:', error);
                return {};
            }
        },
        enabled: !!userAddress && tokens.length > 0,
        staleTime: 60_000, // 60 seconds
        refetchOnWindowFocus: false,
    });
};

export const useTokenListPrices = (tokens: Token[]) => {
    return useQuery({
        queryKey: ['token-list-prices', tokens.map(t => t.address)],
        queryFn: async (): Promise<{ [address: string]: string }> => {
            const prices: { [address: string]: string } = {};

            try {
                // Query all token prices in parallel
                const promises = tokens.map(async (token) => {
                    try {
                        const price = await queryOraclePrice(token.address);
                        prices[token.address.toLowerCase()] = price;
                    } catch (error) {
                        console.error(`Failed to fetch price for token ${token.symbol}:`, error);
                        prices[token.address.toLowerCase()] = '0';
                    }
                });

                await Promise.all(promises);
                console.log('Token list prices fetched:', prices);
                return prices;
            } catch (error) {
                console.error('Failed to fetch token list prices:', error);
                return {};
            }
        },
        enabled: tokens.length > 0,
        staleTime: 60_000, // 60 seconds
        refetchOnWindowFocus: false,
    });
};