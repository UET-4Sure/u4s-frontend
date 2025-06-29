import { config } from 'dotenv'
config();

import { TOKEN_ADDRESSES } from '@/app/(dashboard)/(trade)/swap/constants'
import { ethers } from 'ethers'
import ERC20_ABI from '@/abis/ERC20.json'
import CHAINLINK_PRICE_FEED_ABI from '@/abis/ChainlinkPriceFeed'
import STATE_VIEW_ABI from '@/abis/StateView.json'
import { getPoolConfig } from '@/app/(dashboard)/(trade)/swap/config'
import POOL_MANAGER_ABI from '@/abis/PoolManager.json'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";
const STATE_VIEW_ADDRESS = "0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C";

function poolKeyToId(poolKey: {
    currency0: string,
    currency1: string,
    fee: number,
    tickSpacing: number,
    hooks: string
}): string {

    // Encode the pool key
    const encodedKey = ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint24', 'int24', 'address'],
        [
            poolKey.currency0,
            poolKey.currency1,
            poolKey.fee,
            poolKey.tickSpacing,
            poolKey.hooks
        ]
    );

    // Get the keccak256 hash
    return ethers.utils.keccak256(encodedKey);
}

export async function queryPoolInfo(fromToken: string, toToken: string): Promise<{
    sqrtPriceX96: string;
    tick: number;
    liquidity: string;
}> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const stateViewContract = new ethers.Contract(
            STATE_VIEW_ADDRESS,
            STATE_VIEW_ABI,
            provider
        );
        
        const poolConfig = await getPoolConfig(fromToken, toToken);
        if (!poolConfig) {
            throw new Error('Pool config not found');
        }
        const poolKey = poolConfig.poolKey;

        const slot0 = await stateViewContract.getSlot0(poolKeyToId(poolKey));
        const liquidity = await stateViewContract.getLiquidity(poolKeyToId(poolKey));
        console.log('Sqrt price fetched:', {
            fromToken,
            toToken,
            sqrtPriceX96: slot0.sqrtPriceX96,
            tick: slot0.tick,
            liquidity: liquidity
        });

        return {
            sqrtPriceX96: slot0.sqrtPriceX96,
            tick: slot0.tick,
            liquidity: liquidity
        };
    } catch (error) {
        console.error('Error querying oracle price:', error);
        return {
            sqrtPriceX96: "0",
            tick: 0,
            liquidity: "0"
        };
    }
}

// Example usage
// async function main() {
//     try {
//         const sqrtPrice = await querySqrtPrice(TOKEN_ADDRESSES.WETH, TOKEN_ADDRESSES.USDC);
//         console.log("WETH Price:", sqrtPrice);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// main();