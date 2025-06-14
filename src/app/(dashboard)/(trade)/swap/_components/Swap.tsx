"use client";

import { SwapWidget } from "@/components/widgets/swap/Swap";
import { StackProps } from "@chakra-ui/react";
import { useAccount, useWriteContract } from "wagmi";
import {
  PRICE_LIMITS,
  getPoolConfig,
  getZeroForOne,
} from "./Config";
import ERC20_ABI from "@/abis/ERC20.json";
import POOL_SWAP_TEST_CONTRACT_ABI from "@/abis/PoolSwapTest.json";
import { ethers } from "ethers";

interface Props extends StackProps {}

export const Swap: React.FC<Props> = ({ children, ...props }) => {
  const { writeContractAsync } = useWriteContract();
  const { address: userAddress } = useAccount();

  const handleSwap = async (swapData: any) => {
    try {
      if (!swapData.fromToken || !swapData.toToken || !swapData.fromAmount) {
        console.error("Missing required swap data");
        return;
      }

      // Get pool configuration for the token pair
      const poolConfig = getPoolConfig(
        swapData.fromToken.address,
        swapData.toToken.address
      );

      if (!poolConfig) {
        console.error("No pool found for the selected token pair");
        return;
      }

      // First approve the token
      await writeContractAsync({
        address: swapData.fromToken.address as `0x${string}`,
        abi: ERC20_ABI.abi,
        functionName: "approve",
        args: [poolConfig.poolAddress, ethers.parseUnits(swapData.fromAmount.toString(), 18)],
      });

      const zeroForOne = getZeroForOne(swapData.fromToken.address, poolConfig.poolKey);
      
      // CURRENTLY HARDCODED TO SWAP EXACT TOKEN IN FOR NOW
      const amountSpecified = ethers.parseUnits((-swapData.fromAmount).toString(), 18); 

      // Format pool key as array for contract call
      const poolKeyArray = [
        poolConfig.poolKey.currency0 as `0x${string}`,
        poolConfig.poolKey.currency1 as `0x${string}`,
        poolConfig.poolKey.fee,
        poolConfig.poolKey.tickSpacing,
        poolConfig.poolKey.hooks as `0x${string}`,
      ] as const;

      // SwapParams struct
      const swapParams = [
        zeroForOne,
        amountSpecified,
        zeroForOne ? PRICE_LIMITS.MIN : PRICE_LIMITS.MAX,
      ] as const;

      // TestSettings struct
      const testSettings = [
        false, // takeClaims
        false, // settleUsingBurn
      ] as const;

      const hookData = "0x";

      // Execute the swap
      await writeContractAsync({
        address: poolConfig.poolAddress as `0x${string}`,
        abi: POOL_SWAP_TEST_CONTRACT_ABI.abi,
        functionName: "swap",
        args: [poolKeyArray, swapParams, testSettings, hookData],
      });

    } catch (error) {
      console.error("Error during swap:", error);
    }
  };

  return (
    <SwapWidget
      onSwap={handleSwap}
      userAddress={userAddress}
      {...props}
    />
  );
};
