import { TickMath } from "@uniswap/v3-sdk";
import JSBI from 'jsbi';
import { queryOraclePrice } from '@/script/QueryOraclePrice';

function calculateSqrtPriceX96FromPrice(price: number) {
    const sqrt = BigInt(Math.floor(Math.sqrt(price) * 2**40));
    
    // Calculate 2^96 using BigInt
    const twoTo96 = BigInt(2) ** BigInt(96);
    
    // Multiply and then divide by 2^40 to get the final result
    // We divide by 2^40 because we multiplied sqrt by 2^40 earlier
    const result = (sqrt * twoTo96) >> BigInt(40);
    
    return result;
}

export function calculateTickFromPrice(price: number) {
    const sqrtPriceX96 = calculateSqrtPriceX96FromPrice(price);
    const tick = TickMath.getTickAtSqrtRatio(JSBI.BigInt(sqrtPriceX96.toString()));
    // Round to nearest multiple of 60
    const roundedTick = Math.round(tick / 60) * 60;
    return roundedTick;
}

export async function calculateVolumeLiquidity(token0: string, amount0: number, token1: string, amount1: number) {
    const price0 = Number(await queryOraclePrice(token0));
    const price1 = Number(await queryOraclePrice(token1));
    const volume0 = amount0 * price0;
    const volume1 = amount1 * price1;
    return volume0 + volume1;
}