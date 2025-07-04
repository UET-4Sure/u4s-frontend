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

interface PositionInfo {
    tickLower: number;
    tickUpper: number;
    liquidity: string;
    feeGrowthInside0LastX128: string;
    feeGrowthInside1LastX128: string;
    tokensOwed0: string;
    tokensOwed1: string;
}

export async function getPositionInfo(poolId: string, positionId: string): Promise<PositionInfo> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const stateViewContract = new ethers.Contract(
            STATE_VIEW_ADDRESS,
            STATE_VIEW_ABI,
            provider
        );

        const position = await stateViewContract.getPositionInfo(poolId, positionId);
        
        return {
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            liquidity: position.liquidity.toString(),
            feeGrowthInside0LastX128: position.feeGrowthInside0LastX128.toString(),
            feeGrowthInside1LastX128: position.feeGrowthInside1LastX128.toString(),
            tokensOwed0: position.tokensOwed0.toString(),
            tokensOwed1: position.tokensOwed1.toString()
        };
    } catch (error) {
        console.error('Error getting position info:', error);
        throw error;
    }
}

export async function getPositionLiquidity(poolId: string, positionId: string): Promise<string> {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const stateViewContract = new ethers.Contract(
            STATE_VIEW_ADDRESS,
            STATE_VIEW_ABI,
            provider
        );

        const liquidity = await stateViewContract.getPositionLiquidity(poolId, positionId);
        return liquidity.toString();
    } catch (error) {
        console.error('Error getting position liquidity:', error);
        throw error;
    }
}