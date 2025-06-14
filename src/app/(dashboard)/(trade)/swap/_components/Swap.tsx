"use client";

import { SwapWidget } from "@/components/widgets/swap/Swap";
import { StackProps } from "@chakra-ui/react";
import { useWriteContract } from "wagmi";
import {
  HOOK_CONTRACT,
  MIN_PRICE_LIMIT,
  MAX_PRICE_LIMIT,
  USDC_WETH_POOL_ADDRESS,
  USDC_ADDRESS,
  WETH_ADDRESS,
} from "./Constant";  
import ERC20_ABI from "@/app/(dashboard)/(trade)/swap/abi/ERC20.json";
import POOL_SWAP_TEST_CONTRACT_ABI from "@/app/(dashboard)/(trade)/swap/abi/PoolSwapTest.json";
import { ethers } from "ethers";

interface Props extends StackProps {}

// Define pool configuration type
type PoolConfig = {
  address: `0x${string}`;
  fee: number;
  tickSpacing: number;
  token0: string; // token0 address in lowercase
  token1: string; // token1 address in lowercase
};

// Create a mapping of token pairs to their pool configurations
const POOL_CONFIGS: Record<string, PoolConfig> = {
  [`${WETH_ADDRESS.toLowerCase()}-${USDC_ADDRESS.toLowerCase()}`]: {
    address: USDC_WETH_POOL_ADDRESS as `0x${string}`,
    fee: 3000,
    tickSpacing: 60,
    token0: USDC_ADDRESS.toLowerCase(),
    token1: WETH_ADDRESS.toLowerCase(),
  },
  [`${USDC_ADDRESS.toLowerCase()}-${WETH_ADDRESS.toLowerCase()}`]: {
    address: USDC_WETH_POOL_ADDRESS as `0x${string}`,
    fee: 3000,
    tickSpacing: 60,
    token0: USDC_ADDRESS.toLowerCase(),
    token1: WETH_ADDRESS.toLowerCase(),
  },
};

// Function to get pool configuration based on token addresses
const getPoolConfig = (fromTokenAddress: string, toTokenAddress: string): PoolConfig | null => {
  const key = `${fromTokenAddress.toLowerCase()}-${toTokenAddress.toLowerCase()}`;
  return POOL_CONFIGS[key] || null;
};

// Function to determine zeroForOne based on pool and token order
const getZeroForOne = (fromTokenAddress: string, poolConfig: PoolConfig): boolean => {
  const fromToken = fromTokenAddress.toLowerCase();
  return fromToken === poolConfig.token0;
};

export const Swap: React.FC<Props> = ({ children, ...props }) => {
  const { writeContractAsync } = useWriteContract();

  const handleSwap = async (swapData: any) => {
    console.log("handleSwap called with data:", swapData);
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

      console.log("Approving token...");
      // First approve the token
      await writeContractAsync({
        address: swapData.fromToken.address as `0x${string}`,
        abi: ERC20_ABI.abi,
        functionName: "approve",
        args: [poolConfig.address, ethers.parseUnits(swapData.fromAmount.toString(), 18)],
      });

      // PoolKey struct
      const poolKey = [
        swapData.fromToken.address, // currency0
        swapData.toToken.address, // currency1
        poolConfig.fee, // fee
        poolConfig.tickSpacing, // tickSpacing
        HOOK_CONTRACT, // hooks
      ];

      const amount = -swapData.fromAmount; // @TODO: check if fromAmount is negative, toAmount is positive
      const amountSpecified = ethers.parseUnits(amount.toString(), 18);
      const zeroForOne = getZeroForOne(swapData.fromToken.address, poolConfig);

      // SwapParams struct
      const swapParams = [
        zeroForOne,
        amountSpecified,
        zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT,
      ];

      // TestSettings struct
      const testSettings = [
        false, // takeClaims
        false, // settleUsingBurn
      ];

      const hookData = "0x";

      console.log("Executing swap...");
      // Execute the swap
      await writeContractAsync({
        address: poolConfig.address,
        abi: POOL_SWAP_TEST_CONTRACT_ABI.abi,
        functionName: "swap",
        args: [poolKey, swapParams, testSettings, hookData],
      });

      console.log("Swap executed successfully");
    } catch (error) {
      console.error("Error during swap:", error);
    }
  };

  return (
    <SwapWidget
      onSwap={handleSwap}
      {...props}
    />
  );
};
