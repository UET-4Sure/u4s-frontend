"use client";

import { Button } from '@/components/ui/button';
import { SelectTokenDialog } from '@/components/widgets/components/SelectTokenDialog';
import { HStack, Input, StackProps, StepsTitle, Text, useSteps, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { useTokenList } from '@/hooks/data/useTokenList';
import { StepsCompletedContent, StepsContent, StepsIndicator, StepsItem, StepsList, StepsNextTrigger, StepsRoot } from '@/components/ui/steps';
import { SwapWidget } from '@/components/widgets/swap/Swap';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { getPoolConfig, POOL_ADDRESSES, TOKEN_ADDRESSES, HOOK_CONTRACT_ADDRESS } from '@/app/(dashboard)/(trade)/swap/config';
import { errors, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { toaster } from '@/components/ui/toaster';
import POSITION_MANAGER_ABI from '@/abis/PositionManager.json';
import ERC20_ABI from '@/abis/ERC20.json';
import PERMIT2_ABI from '@/abis/Permit2.json';
import POOL_MANAGER_ABI from '@/abis/PoolManager.json';
import { Position, Pool } from '@uniswap/v4-sdk';
import { Token as UniswapToken } from '@uniswap/sdk-core';
import { Token as LocalToken } from '@/components/widgets/type';
import { PositionWidget } from '@/components/widgets/position/PositionWidget';
import {
    FeeAmount,
    TickMath,
    Pool as V3Pool,
    Position as V3Position,
    encodeSqrtRatioX96,
} from '@uniswap/v3-sdk';
import { queryPoolInfo } from '@/script/QuerySqrtPrice';


const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const POSITION_MANAGER_ADDRESS = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";
const POOL_MANAGER_ADDRESS = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";

const MotionVStack = motion.create(VStack);
const MotionStepContent = motion.create(StepsContent);

interface CreatePositionFormValues {
    fromToken: LocalToken;
    toToken: LocalToken;
    slippage: string;
}

const DEFAULT_FEE = 3000; // 0.30%
const DEFAULT_TICK_SPACING = 60;

interface CreatePositionFormProps extends StackProps {
}

export const CreatePositionForm: React.FC<CreatePositionFormProps> = ({ children, ...props }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const steps = useSteps({
        defaultStep: 0,
        count: 2,
        linear: true,
    })
    const { data: tokenList } = useTokenList();
    const { writeContractAsync } = useWriteContract();
    const { address: userAddress } = useAccount();

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreatePositionFormValues>({
        defaultValues: {
            slippage: "0.5"
        }
    });

    const onSubmit = async (data: CreatePositionFormValues) => {
        try {
            if (!data.fromToken || !data.toToken) {
                toaster.error({
                    title: "Lỗi tạo vị thế",
                    description: "Vui lòng chọn cả hai token.",
                });
                return;
            }

            const poolConfig = await getPoolConfig(data.fromToken.address, data.toToken.address);
            if (!poolConfig) {
                toaster.error({
                    title: "Lỗi tạo vị thế",
                    description: "Không tìm thấy pool cho token của bạn.",
                });
                return;
            }

            steps.goToNextStep();
        } catch (error) {
            console.error("Error creating position:", error);
            toaster.error({
                title: "Position Creation Error",
                description: "Failed to create position. Please try again.",
            });
        }
    }

    const Step1 = useMemo(() => () => (
        <MotionVStack
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            align={"start"}
            w={"full"}
            gap={4}
        >
            <FormFieldTitle
                title="Tạo vị thế"
                description="Chọn token để tạo vị thế mới"
            />
            <HStack align={"start"} w={"full"}>
                <Controller
                    name="fromToken"
                    control={control}
                    render={({ field }) => (
                        <SelectTokenDialog
                            title={field.value?.symbol}
                            triggerProps={{
                                bg: field.value ? "bg.subtle" : "",
                                color: field.value ? "bg.inverted" : "",
                            }}
                            tokenList={tokenList || []}
                            placeholder="Chọn token cung cấp"
                            selectedToken={field.value}
                            onSelectToken={(token) => {
                                field.onChange(token);
                            }}
                        />
                    )}
                />
                <Controller
                    name="toToken"
                    control={control}
                    render={({ field }) => (
                        <SelectTokenDialog
                            title={field.value?.symbol}
                            tokenList={tokenList || []}
                            placeholder="Chọn token nhận"
                            selectedToken={field.value}
                            onSelectToken={(token) => {
                                field.onChange(token);
                            }}
                            triggerProps={{
                                bg: field.value ? "bg.subtle" : "",
                                color: field.value ? "bg.inverted" : "",
                            }}
                        />
                    )}
                />
            </HStack>

            <StepsNextTrigger asChild>
                <Button
                    disabled={!watch("fromToken") || !watch("toToken")}
                    w={"full"}
                    onClick={() => {
                        if (!watch("fromToken") || !watch("toToken")) {
                            toaster.error({
                                title: "Lỗi tạo vị thế",
                                description: "Vui lòng chọn cả hai token.",
                            });
                            return;
                        }
                        steps.setStep(1);
                    }}
                >
                    Tiếp tục
                </Button>
            </StepsNextTrigger>
        </MotionVStack >
    ), [tokenList, handleSubmit, watch, register, errors]);

    const Step2 = useMemo(() => () => {
        const fromToken = watch("fromToken");
        const toToken = watch("toToken");
        const { writeContractAsync } = useWriteContract();
        const publicClient = usePublicClient();
        const { address: userAddress } = useAccount();

        // Create a token list with only the selected tokens
        const selectedTokens = [fromToken, toToken].filter(Boolean) as LocalToken[];

        const handleCreatePosition = async (fromToken: LocalToken, toToken: LocalToken, fromAmount: string, toAmount: string) => {
            try {
                const poolConfig = await getPoolConfig(fromToken.address, toToken.address);
                if (!poolConfig) {
                    toaster.error({
                        title: "Lỗi tạo vị thế",
                        description: "Không tìm thấy pool cho token của bạn.",
                    });
                    return;
                }

                // First approve tokens to Permit2
                await writeContractAsync({
                    address: fromToken.address as `0x${string}`,
                    abi: ERC20_ABI.abi,
                    functionName: "approve",
                    args: [PERMIT2_ADDRESS as `0x${string}`, ethers.constants.MaxUint256],
                });

                await writeContractAsync({
                    address: toToken.address as `0x${string}`,
                    abi: ERC20_ABI.abi,
                    functionName: "approve",
                    args: [PERMIT2_ADDRESS as `0x${string}`, ethers.constants.MaxUint256],
                });

                // Then approve Permit2 to spend tokens
                const MAX_UINT48 = "281474976710655"; // 2^48 - 1
                const MAX_UINT160 = "1461501637330902918203684832716283019655932542975"; // 2^160 - 1

                await writeContractAsync({
                    address: PERMIT2_ADDRESS as `0x${string}`,
                    abi: PERMIT2_ABI,
                    functionName: "approve",
                    args: [
                        fromToken.address,
                        POSITION_MANAGER_ADDRESS,
                        MAX_UINT160,
                        MAX_UINT48
                    ],
                });

                await writeContractAsync({
                    address: PERMIT2_ADDRESS as `0x${string}`,
                    abi: PERMIT2_ABI,
                    functionName: "approve",
                    args: [
                        toToken.address,
                        POSITION_MANAGER_ADDRESS,
                        MAX_UINT160,
                        MAX_UINT48
                    ],
                });

                if (!publicClient) {
                    throw new Error("Public client not available");
                }

                const provider = new ethers.providers.Web3Provider(publicClient.transport);
                const { sqrtPriceX96, tick, liquidity } = await queryPoolInfo(fromToken.address, toToken.address);

                const token0 = new UniswapToken(publicClient.chain.id, fromToken.address, fromToken.decimals, fromToken.symbol, fromToken.name);
                const token1 = new UniswapToken(publicClient.chain.id, toToken.address, toToken.decimals, toToken.symbol, toToken.name);

                const pool = new Pool(
                    token0,
                    token1,
                    DEFAULT_FEE,
                    DEFAULT_TICK_SPACING,
                    HOOK_CONTRACT_ADDRESS.HOOK,
                    sqrtPriceX96.toString(),
                    liquidity.toString(),
                    tick,
                );

                // Calculate the widest possible range that aligns with tick spacing
                // const tickLower = Math.ceil(TickMath.MIN_TICK / DEFAULT_TICK_SPACING) * DEFAULT_TICK_SPACING;
                // const tickUpper = Math.floor(TickMath.MAX_TICK / DEFAULT_TICK_SPACING) * DEFAULT_TICK_SPACING;

                const tickLower = -600;
                const tickUpper = 600;

                console.log(tickLower, tickUpper);

                const position = Position.fromAmounts({
                    pool: pool,
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    amount0: parseUnits(fromAmount, fromToken.decimals).toString(),
                    amount1: parseUnits(toAmount, toToken.decimals).toString(),
                    useFullPrecision: true,
                });
                

                // slippage limits - add 1 wei to each amount
                const amount0Max = parseUnits(fromAmount, fromToken.decimals).add(1);
                const amount1Max = parseUnits(toAmount, toToken.decimals).add(1);

                // Set deadline to 20 minutes from now
                const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

                // Empty hook data
                const hookData = "0x";

                // Prepare mint parameters
                const mintParams = ethers.utils.defaultAbiCoder.encode(
                    ["tuple(address,address,uint24,int24,address)", "int24", "int24", "uint256", "uint256", "uint256", "address", "bytes"],
                    [
                        [
                            poolConfig.poolKey.currency0,
                            poolConfig.poolKey.currency1,
                            poolConfig.poolKey.fee,
                            poolConfig.poolKey.tickSpacing,
                            poolConfig.poolKey.hooks
                        ],
                        position.tickLower,
                        position.tickUpper,
                        position.liquidity.toString(),
                        amount0Max,
                        amount1Max,
                        userAddress,
                        hookData
                    ]
                );

                const settleParams = ethers.utils.defaultAbiCoder.encode(
                    ["address", "address"],
                    [poolConfig.poolKey.currency0, poolConfig.poolKey.currency1]
                );

                // Encode the actions and parameters together
                const encodedData = ethers.utils.defaultAbiCoder.encode(
                    ["bytes", "bytes[]"],
                    [
                        ethers.utils.solidityPack(
                            ["uint8", "uint8"],
                            [2, 13] // SETTLE_PAIR = 2, MINT_POSITION = 13
                        ),
                        [mintParams, settleParams]
                    ]
                );

                await writeContractAsync({
                    address: POSITION_MANAGER_ADDRESS as `0x${string}`,
                    abi: POSITION_MANAGER_ABI.abi,
                    functionName: "modifyLiquidities",
                    args: [
                        encodedData,
                        deadline
                    ]
                });

                toaster.success({
                    title: "Vị thế đã được tạo",
                    description: "Vị thế của bạn đã được tạo thành công.",
                });

                steps.goToNextStep();
            } catch (error) {
                console.error("Error creating position:", error);
                toaster.error({
                    title: "Lỗi tạo vị thế",
                    description: "Có lỗi xảy ra khi tạo vị thế. Vui lòng thử lại.",
                });
            }
        };

        return (
            <MotionVStack
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                align={"start"}
                w={"full"}
                gap={4}
            >
                <FormFieldTitle
                    title="Chọn số lượng token"
                    description={`Nhập số lượng ${fromToken?.symbol} và ${toToken?.symbol} bạn muốn cung cấp`}
                />
                <PositionWidget
                    defaultFromToken={fromToken}
                    defaultToToken={toToken}
                    tokenList={selectedTokens}
                    userAddress={userAddress}
                    onCreatePosition={handleCreatePosition}
                />
                {/* <StepsNextTrigger asChild>
                    <Button
                        w={"full"}
                        colorPalette={"primary"}
                        type="submit"
                    >
                        Tạo vị thế
                    </Button>
                </StepsNextTrigger> */}
            </MotionVStack>
        );
    }, [watch, errors]);

    const stepRenders = [
        {
            title: "Tạo vị thế",
            description: "Chọn token để tạo vị thế mới",
            content: <Step1 />
        },
        {
            title: "Hoàn thành",
            description: "Vị thế của bạn đã được tạo thành công",
            content: <Step2 />
        }
    ]

    const isStep1Completed = !!(watch("fromToken") && watch("toToken"));

    return (
        <form style={{ width: '100%' }}>
            <StepsRoot
                colorPalette={"bg"}
                orientation={"vertical"}
                defaultStep={0}
                linear={isStep1Completed}
            >
                <StepsList>
                    {stepRenders.map((step, index) => (
                        <StepsItem
                            key={index}
                            index={index}
                            title={step.title}
                            description={step.description}
                        >
                            <StepsTitle>
                                {step.title}
                            </StepsTitle>
                        </StepsItem>
                    ))}
                </StepsList>
                <AnimatePresence mode="wait">
                    {stepRenders.map((step, index) => (
                        <StepsContent
                            key={index}
                            index={index}
                        >
                            {step.content}
                        </StepsContent>
                    ))}
                </AnimatePresence>
            </StepsRoot>
        </form>
    );
};

const FormFieldTitle: React.FC<{ title: string, description?: string }> = ({ title, description }) => (
    <VStack align={"start"} w={"full"}>
        <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        {description && <Text fontSize="sm" color="fg.subtle">{description}</Text>}
    </VStack>
);