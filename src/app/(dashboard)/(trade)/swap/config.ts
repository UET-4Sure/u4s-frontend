import { Token } from "@/components/widgets/type";
import { 
  USDC_WETH_CONFIG,
  USDC_WBTC_CONFIG,
  USDC_LINK_CONFIG,
  USDC_EUR_CONFIG,
  WBTC_WETH_CONFIG,
  WETH_LINK_CONFIG,
  EUR_WETH_CONFIG,
  WBTC_LINK_CONFIG,
  WBTC_EUR_CONFIG,
  EUR_LINK_CONFIG,
  PoolConfig
} from "./poolConfig";
import { TOKEN_ADDRESSES, HOOK_CONTRACT_ADDRESS, POOL_SWAP_TEST, PRICE_LIMITS } from "./constants";

const TOKEN_LIST: Token[] = [
  {
    address: TOKEN_ADDRESSES.WETH,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    address: TOKEN_ADDRESSES.USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    address: TOKEN_ADDRESSES.WBTC,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  },
  {
    address: TOKEN_ADDRESSES.LINK,
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
  },
  {
    address: TOKEN_ADDRESSES.EUR,
    symbol: 'EUR',
    name: 'Euro',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png',
  }
];

// Pool Configurations Map
const POOL_CONFIGS = new Map<string, PoolConfig>([
  // USDC - WETH
  [`${TOKEN_ADDRESSES.WETH.toLowerCase()}-${TOKEN_ADDRESSES.USDC.toLowerCase()}`, USDC_WETH_CONFIG],
  [`${TOKEN_ADDRESSES.USDC.toLowerCase()}-${TOKEN_ADDRESSES.WETH.toLowerCase()}`, USDC_WETH_CONFIG],
  // USDC - WBTC
  [`${TOKEN_ADDRESSES.WBTC.toLowerCase()}-${TOKEN_ADDRESSES.USDC.toLowerCase()}`, USDC_WBTC_CONFIG],
  [`${TOKEN_ADDRESSES.USDC.toLowerCase()}-${TOKEN_ADDRESSES.WBTC.toLowerCase()}`, USDC_WBTC_CONFIG],
  // USDC - LINK
  [`${TOKEN_ADDRESSES.LINK.toLowerCase()}-${TOKEN_ADDRESSES.USDC.toLowerCase()}`, USDC_LINK_CONFIG],
  [`${TOKEN_ADDRESSES.USDC.toLowerCase()}-${TOKEN_ADDRESSES.LINK.toLowerCase()}`, USDC_LINK_CONFIG],
  // USDC - EUR
  [`${TOKEN_ADDRESSES.EUR.toLowerCase()}-${TOKEN_ADDRESSES.USDC.toLowerCase()}`, USDC_EUR_CONFIG],
  [`${TOKEN_ADDRESSES.USDC.toLowerCase()}-${TOKEN_ADDRESSES.EUR.toLowerCase()}`, USDC_EUR_CONFIG],
  // WBTC - WETH
  [`${TOKEN_ADDRESSES.WBTC.toLowerCase()}-${TOKEN_ADDRESSES.WETH.toLowerCase()}`, WBTC_WETH_CONFIG],
  [`${TOKEN_ADDRESSES.WETH.toLowerCase()}-${TOKEN_ADDRESSES.WBTC.toLowerCase()}`, WBTC_WETH_CONFIG],
  // WETH - LINK
  [`${TOKEN_ADDRESSES.WETH.toLowerCase()}-${TOKEN_ADDRESSES.LINK.toLowerCase()}`, WETH_LINK_CONFIG],
  [`${TOKEN_ADDRESSES.LINK.toLowerCase()}-${TOKEN_ADDRESSES.WETH.toLowerCase()}`, WETH_LINK_CONFIG],
  // EUR - WETH
  [`${TOKEN_ADDRESSES.EUR.toLowerCase()}-${TOKEN_ADDRESSES.WETH.toLowerCase()}`, EUR_WETH_CONFIG],
  [`${TOKEN_ADDRESSES.WETH.toLowerCase()}-${TOKEN_ADDRESSES.EUR.toLowerCase()}`, EUR_WETH_CONFIG],
  // WBTC - LINK
  [`${TOKEN_ADDRESSES.WBTC.toLowerCase()}-${TOKEN_ADDRESSES.LINK.toLowerCase()}`, WBTC_LINK_CONFIG],
  [`${TOKEN_ADDRESSES.LINK.toLowerCase()}-${TOKEN_ADDRESSES.WBTC.toLowerCase()}`, WBTC_LINK_CONFIG],
  // WBTC - EUR
  [`${TOKEN_ADDRESSES.WBTC.toLowerCase()}-${TOKEN_ADDRESSES.EUR.toLowerCase()}`, WBTC_EUR_CONFIG],
  [`${TOKEN_ADDRESSES.EUR.toLowerCase()}-${TOKEN_ADDRESSES.WBTC.toLowerCase()}`, WBTC_EUR_CONFIG],
  // EUR - LINK
  [`${TOKEN_ADDRESSES.EUR.toLowerCase()}-${TOKEN_ADDRESSES.LINK.toLowerCase()}`, EUR_LINK_CONFIG],
  [`${TOKEN_ADDRESSES.LINK.toLowerCase()}-${TOKEN_ADDRESSES.EUR.toLowerCase()}`, EUR_LINK_CONFIG],
]);

// Helper Functions
const getPoolConfig = (fromTokenAddress: string, toTokenAddress: string): PoolConfig | null => {
  const key = `${fromTokenAddress.toLowerCase()}-${toTokenAddress.toLowerCase()}`;
  return POOL_CONFIGS.get(key) || null;
};

const getZeroForOne = (tokenAddress: string, poolKey: PoolConfig['poolKey']): boolean => {
  return tokenAddress.toLowerCase() === poolKey.currency0.toLowerCase();
};

export {
  POOL_SWAP_TEST,
  TOKEN_ADDRESSES,
  TOKEN_LIST,
  PRICE_LIMITS,
  getPoolConfig,
  getZeroForOne,
  HOOK_CONTRACT_ADDRESS,
};


