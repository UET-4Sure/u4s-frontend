"use client";

import { SwapWidget } from "@/components/widgets/swap/Swap";
import { StackProps } from "@chakra-ui/react";
import { useAccount, useWriteContract } from "wagmi";
import {
  PRICE_LIMITS,
  TOKEN_LIST,
  getPoolConfig,
  getZeroForOne,
  POOL_SWAP_TEST,
} from "../config";
import ERC20_ABI from "@/abis/ERC20.json";
import POOL_SWAP_TEST_CONTRACT_ABI from "@/abis/PoolSwapTest.json";
import { ethers } from "ethers";
import { SwapState } from "@/components/widgets/type";
import { toaster } from "@/components/ui/toaster";
import { checkHasSBT } from "@/script/CheckHasSBT";
import { queryOraclePrice } from "@/script/QueryOraclePrice";
import { useState } from "react";
import { RequireKycApplicationDialog } from "@/app/(dashboard)/_components/RequireKycApplicationDialog";
import { ContractFunctionExecutionError, TransactionExecutionError } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { waitForTransactionReceipt } from "@wagmi/core";
import reown from "@/utils/reown";

interface Props extends StackProps { }

export function Swap({ ...props }: Props) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [openRequireKycDialog, setOpenRequireKycDialog] = useState(false);
  const queryClient = useQueryClient();

  const handleSwap = async (swapData: SwapState) => {
    try {
      // Get token price and calculate volume
      const oraclePrice = await queryOraclePrice(swapData.fromToken?.address || "");
      const volume = Number(swapData.fromAmount) * Number(oraclePrice);

      if (volume >= 10000) {
        toaster.warning({
          title: "Đã đạt giới hạn giao dịch",
          description: "Không thể thực hiện giao dịch với khối lượng này.",
        });
        return;
      }

      // Check SBT requirement for high volume trades
      if (volume >= 500) {
        const hasSBT = await checkHasSBT(address || "");
        if (!hasSBT) {
          setOpenRequireKycDialog(true);
          return;
        }
      }

      if (!swapData.fromToken || !swapData.toToken || !swapData.fromAmount) {
        toaster.error({
          title: "Swap Error",
          description: "Please ensure all fields are filled out correctly.",
        })
        return;
      }

      // Get pool configuration for the token pair
      const poolConfig = getPoolConfig(
        swapData.fromToken.address,
        swapData.toToken.address
      );

      if (!poolConfig) {
        toaster.error({
          title: "Swap Error",
          description: "No pool found for the selected token pair.",
        });
        return;
      }

      // First approve the token
      await writeContractAsync({
        address: swapData.fromToken.address as `0x${string}`,
        abi: ERC20_ABI.abi,
        functionName: "approve",
        args: [POOL_SWAP_TEST, ethers.utils.parseUnits(swapData.fromAmount.toString(), 18)],
      });

      const zeroForOne = getZeroForOne(swapData.fromToken.address, poolConfig.poolKey);

      // CURRENTLY HARDCODED TO SWAP EXACT TOKEN IN FOR NOW
      const amountSpecified = ethers.utils.parseUnits((-swapData.fromAmount).toString(), 18);

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
      const hash = await writeContractAsync({
        address: POOL_SWAP_TEST as `0x${string}`,
        abi: POOL_SWAP_TEST_CONTRACT_ABI.abi,
        functionName: "swap",
        args: [poolKeyArray, swapParams, testSettings, hookData],
      });
      await waitForTransactionReceipt(reown.wagmiAdapter.wagmiConfig, { hash });
      
      queryClient.invalidateQueries({
        queryKey: ['token-balance', swapData.fromToken.address, address],
      });

      queryClient.invalidateQueries({
        queryKey: ['token-balance', swapData.toToken.address, address],
      });

      toaster.success({
        title: "Swap successful",
        description: "Your swap has been executed successfully",
      });
    } catch (error) {
      // if error is instance error of wallet (sign, ...), show error message
      if (error instanceof TransactionExecutionError || error instanceof ContractFunctionExecutionError) {
        toaster.error({
          title: "Lỗi giao dịch",
          description: "Giao dịch không thành công. Vui lòng kiểm tra lại thông tin và thử lại.",
        });
        return;
      }

      toaster.error({
        title: "Swap Error",
        description: error instanceof Error ? error.message : "An error occurred during swap",
      });
    }
  };

  return (
    <>
      <SwapWidget
        onSwap={handleSwap}
        userAddress={address}
        tokenList={TOKEN_LIST}
        {...props}
      />
      <RequireKycApplicationDialog open={openRequireKycDialog} onOpenChange={(value) => { setOpenRequireKycDialog(value.open) }} />
    </>
  );
}
