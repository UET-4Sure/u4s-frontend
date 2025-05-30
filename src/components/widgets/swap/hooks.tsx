import { useState, useCallback, useMemo } from 'react';
import { SwapState, SwapQuote, Token } from './type';
import { debounce } from 'lodash';
import { useQuery } from '@tanstack/react-query';

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

    const swapTokens = useCallback(() => {
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
        swapTokens,
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
            const response = await fetch('/api/swap/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromToken: fromToken!.address,
                    toToken: toToken!.address,
                    amount: debouncedAmount,
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch quote');

            const quote: SwapQuote = await response.json();

            if (onQuoteUpdate) {
                onQuoteUpdate(quote);
            }

            return await response.json();
        },
        enabled,
        staleTime: 30_000, // 30 seconds
        retry: false,
    });
};


export const useTokenBalance = (token: Token | null, userAddress?: string) => {
    return useQuery({
        queryKey: ['token-balance', token?.address, userAddress],
        queryFn: async (): Promise<string> => {
            if (!token || !userAddress) return '0';

            const response = await fetch(`/api/balance/${token.address}/${userAddress}`);
            if (!response.ok) throw new Error('Failed to fetch balance');

            const data = await response.json();
            return data.balance as string;
        },
        enabled: !!token && !!userAddress,
        staleTime: 30_000, // 30 seconds
        refetchOnWindowFocus: false,
    });
};