export interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    balance?: string;
    price?: string;
    chainId?: number;
}

export interface SwapState {
    fromToken: Token | null;
    toToken: Token | null;
    fromAmount: string;
    toAmount: string;
    slippage: number;
    isLoading: boolean;
    error: string | null;
}

export interface SwapQuote {
    fromAmount: string;
    toAmount: string;
    priceImpact: number;
    fee: string;
    route: any[];
}