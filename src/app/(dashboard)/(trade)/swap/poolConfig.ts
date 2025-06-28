import { HOOK_CONTRACT_ADDRESS, TOKEN_ADDRESSES } from "./constants";

export interface PoolConfig {
  poolKey: {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
  }
}

export const USDC_WETH_CONFIG: PoolConfig = {
    poolKey: {
      currency0: TOKEN_ADDRESSES.USDC.toLowerCase(),
      currency1: TOKEN_ADDRESSES.WETH.toLowerCase(),
      fee: 3000,
      tickSpacing: 60,
      hooks: HOOK_CONTRACT_ADDRESS.HOOK,
    }
};

export const USDC_WBTC_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.USDC.toLowerCase(),
    currency1: TOKEN_ADDRESSES.WBTC.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const USDC_LINK_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.USDC.toLowerCase(),
    currency1: TOKEN_ADDRESSES.LINK.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const USDC_EUR_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.USDC.toLowerCase(),
    currency1: TOKEN_ADDRESSES.EUR.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const WBTC_WETH_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.WBTC.toLowerCase(),
    currency1: TOKEN_ADDRESSES.WETH.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const WETH_LINK_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.WETH.toLowerCase(),
    currency1: TOKEN_ADDRESSES.LINK.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const EUR_WETH_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.EUR.toLowerCase(),
    currency1: TOKEN_ADDRESSES.WETH.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const WBTC_LINK_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.WBTC.toLowerCase(),
    currency1: TOKEN_ADDRESSES.LINK.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const WBTC_EUR_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.WBTC.toLowerCase(),
    currency1: TOKEN_ADDRESSES.EUR.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};

export const EUR_LINK_CONFIG: PoolConfig = {
  poolKey: {
    currency0: TOKEN_ADDRESSES.EUR.toLowerCase(),
    currency1: TOKEN_ADDRESSES.LINK.toLowerCase(),
    fee: 3000,
    tickSpacing: 60,
    hooks: HOOK_CONTRACT_ADDRESS.HOOK,
  }
};
