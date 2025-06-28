import { TickMath } from "@uniswap/v3-sdk";
import JSBI from 'jsbi';

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