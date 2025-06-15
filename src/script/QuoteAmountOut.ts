import { config } from 'dotenv'
config();

import { SwapExactInSingle } from '@uniswap/v4-sdk'
import { getPoolConfig, getZeroForOne, TOKEN_ADDRESSES } from '@/app/(dashboard)/(trade)/swap/config'
import { ethers } from 'ethers'
import QUOTER_ABI from '@/abis/V4Quoter.json'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";

const QUOTER_CONTRACT_ADDRESS = '0x61b3f2011a92d183c7dbadbda940a7555ccf9227';

export async function quoteAmountOut(tokenIn: string, tokenOut: string, amountIn: number) {
    const quoterContract = new ethers.Contract(
        QUOTER_CONTRACT_ADDRESS,
        QUOTER_ABI.abi,
        new ethers.JsonRpcProvider(RPC_URL)
    )

    const poolConfig = getPoolConfig(tokenIn, tokenOut);
    if (!poolConfig) {
        throw new Error(`No pool found for token pair ${tokenIn}-${tokenOut}`);
    }
    const zeroForOne = getZeroForOne(tokenIn, poolConfig.poolKey);

    // Use staticCall for read-only operations
    try {
        const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall({
            poolKey: poolConfig.poolKey,
            zeroForOne: zeroForOne,
            exactAmount: ethers.parseUnits(amountIn.toString(), 18), 
            hookData: "0x00",
        })
        return ethers.formatUnits(quotedAmountOut.amountOut, 18);
    } catch (error) {
        return 0;
    }
}

// // Add test function
// async function main() {
//     try {
//         const amountOut = await quoteAmountOut(TOKEN_ADDRESSES.USDC, TOKEN_ADDRESSES.WETH, 1);
//         console.log("Amount out:", amountOut);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// main();