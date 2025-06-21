import { Token } from "@/components/widgets/type";
import { useQuery } from "@tanstack/react-query";

export function useTokenList() {
    return useQuery({
        queryKey: ["tokenList"],
        queryFn: async () => {
            const tokens: Token[] = [
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
            ];

            return tokens;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1 minute
    })
}