export const USDC_WETH_POOL_ADDRESS =
  "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe";
export const USDC_WBTC_POOL_ADDRESS =
  "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe";
export const USDC_LINK_POOL_ADDRESS =
  "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe";
export const USDC_EUR_POOL_ADDRESS =
  "0x9B6b46e2c869aa39918Db7f52f5557FE577B6eEe";
  
export const USDC_ADDRESS = "0x0ff5065E79c051c3D4C790BC9e8ebc9b4E56bbcc";
export const WETH_ADDRESS = "0x342d6127609A5Ad63C93E10cb73b7d9dE9bC43Aa";
export const WBTC_ADDRESS = "0x12Df3798C30532c068306372d24c9f2f451676e9";
export const LINK_ADDRESS = "0x88B42E9E9E769F86ab499D8cb111fcb6f691F70E";
export const EUR_ADDRESS = "0x336d87aEdF99d5Fb4F07132C8DbE4bea4c766eAc";

export const POOL_SWAP_TEST_CONTRACT_ABI = [
  "function swap((address,address,uint24,int24,address),(bool,int256,uint160),(bool,bool),bytes) external",
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];


export const HOOK_CONTRACT = "0x1Ff2989dDF08D3a6c4e9EcC53895e89EdD98cAC8";

// Price limits
export const MIN_PRICE_LIMIT = "4295128740"; // 2^32
export const MAX_PRICE_LIMIT =
  "1461446703485210103287273052203988822378723970341"; // ~2^96
