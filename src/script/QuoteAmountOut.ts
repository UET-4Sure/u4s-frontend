import { config } from 'dotenv'
config();

import { SwapExactInSingle } from '@uniswap/v4-sdk'
import { getPoolConfig, getZeroForOne } from '@/app/(dashboard)/(trade)/swap/config'
import { TOKEN_ADDRESSES } from '@/app/(dashboard)/(trade)/swap/constants'
import { ethers } from 'ethers'
import QUOTER_ABI from '@/abis/V4Quoter.json'
import { queryOraclePrice } from './QueryOraclePrice';
import { queryPoolInfo } from './QuerySqrtPrice';
import { Decimal } from 'decimal.js';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";

const QUOTER_CONTRACT_ADDRESS = "0x61b3f2011a92d183c7dbadbda940a7555ccf9227";

export async function quoteAmountOut(tokenIn: string, tokenOut: string, amountIn: number) {
    
    // NOTE: this is just a temporary solution to get the amount out for high volume trades
    const oraclePrice = await queryOraclePrice(tokenIn);
    const volume = amountIn * Number(oraclePrice);
    if(amountIn <= 0 || volume > 10000) {
        return 0;
    }
    if(volume >= 500) {
        return quoteAmmPrice(tokenIn, tokenOut, amountIn);
    }
    
    const quoterContract = new ethers.Contract(
        QUOTER_CONTRACT_ADDRESS,
        QUOTER_ABI.abi,
        new ethers.providers.JsonRpcProvider(RPC_URL)
    )

    const poolConfig = getPoolConfig(tokenIn, tokenOut);
    if (!poolConfig) {
        throw new Error(`No pool found for token pair ${tokenIn}-${tokenOut}`);
    }
    const zeroForOne = getZeroForOne(tokenIn, poolConfig.poolKey);

    // Use staticCall for read-only operations
    try {
        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
            poolKey: poolConfig.poolKey,
            zeroForOne: zeroForOne,
            exactAmount: ethers.utils.parseUnits(amountIn.toString(), 18),
            hookData: "0x00"
        });
        console.log("quotedAmountOut", quotedAmountOut.amountOut.toString());
        return ethers.utils.formatUnits(quotedAmountOut.amountOut, 18);
    } catch (error) {
        console.error("Error quoting amount out:", error);
        return 0;
    }
}

export async function quoteAmmPrice(tokenIn: string, tokenOut: string, amountIn: number) {
    const poolInfo = await queryPoolInfo(tokenIn, tokenOut);
    const poolConfig = getPoolConfig(tokenIn, tokenOut);
    const sqrtPriceX96 = poolInfo.sqrtPriceX96;
    const sqrtPriceX96Decimal = new Decimal(sqrtPriceX96.toString());
    const numerator = sqrtPriceX96Decimal.pow(2);
    const denominator = new Decimal(2).pow(192);
    const priceDecimal = numerator.div(denominator);

    let finalPrice = priceDecimal;

    if(tokenIn.toLowerCase() === poolConfig?.poolKey.currency1) {
        finalPrice = new Decimal(1).div(priceDecimal);
    }

    // console.log("amount out", amountIn * finalPrice.toNumber());
    return amountIn * finalPrice.toNumber();
}