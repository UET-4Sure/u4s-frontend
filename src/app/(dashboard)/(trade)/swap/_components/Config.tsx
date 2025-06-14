// Pool Addresses
const POOL_ADDRESSES = {
  USDC_WETH: "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe",
  USDC_WBTC: "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe",
  USDC_LINK: "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe",
  USDC_EUR: "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe",
} as const;

// Token Addresses
const TOKEN_ADDRESSES = {
  USDC: "0x0ff5065E79c051c3D4C790BC9e8ebc9b4E56bbcc",
  WETH: "0x342d6127609A5Ad63C93E10cb73b7d9dE9bC43Aa",
  WBTC: "0x12Df3798C30532c068306372d24c9f2f451676e9",
  LINK: "0x88B42E9E9E769F86ab499D8cb111fcb6f691F70E",
  EUR: "0x336d87aEdF99d5Fb4F07132C8DbE4bea4c766eAc",
} as const;

// Contract Addresses
const HOOK_CONTRACT_ADDRESS = {
  HOOK: "0x1Ff2989dDF08D3a6c4e9EcC53895e89EdD98cAC8",
} as const;

// Price Limits
const PRICE_LIMITS = {
  MIN: "4295128740", // 2^32
  MAX: "1461446703485210103287273052203988822378723970341", // ~2^96
} as const;

// Pool Key Types
type PoolKey = {
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  hooks: string;
};

// Pool Configuration
type PoolConfig = {
  poolKey: PoolKey;
  poolAddress: string;
};

// USDC-WETH Pool Configuration
const USDC_WETH_CONFIG: PoolConfig = {
  poolKey: {
    token0: TOKEN_ADDRESSES.USDC.toLowerCase(),
    token1: TOKEN_ADDRESSES.WETH.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  },
  poolAddress: POOL_ADDRESSES.USDC_WETH as `0x${string}`,
};

// Pool Configurations Map
const POOL_CONFIGS = new Map<string, PoolConfig>([
  [`${TOKEN_ADDRESSES.WETH.toLowerCase()}-${TOKEN_ADDRESSES.USDC.toLowerCase()}`, USDC_WETH_CONFIG],
  [`${TOKEN_ADDRESSES.USDC.toLowerCase()}-${TOKEN_ADDRESSES.WETH.toLowerCase()}`, USDC_WETH_CONFIG],
]);

// Helper Functions
const getPoolConfig = (fromTokenAddress: string, toTokenAddress: string): PoolConfig | null => {
  const key = `${fromTokenAddress.toLowerCase()}-${toTokenAddress.toLowerCase()}`;
  return POOL_CONFIGS.get(key) || null;
};

const getZeroForOne = (fromTokenAddress: string, poolKey: PoolKey): boolean => {
  const fromToken = fromTokenAddress.toLowerCase();
  return fromToken === poolKey.token0;
};

export {
  TOKEN_ADDRESSES,
  POOL_ADDRESSES,
  PRICE_LIMITS,
  getPoolConfig,
  getZeroForOne,
};


