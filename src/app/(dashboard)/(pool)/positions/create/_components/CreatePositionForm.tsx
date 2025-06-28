"use client";

import { Button } from '@/components/ui/button';
import { SelectTokenDialog } from '@/components/widgets/components/SelectTokenDialog';
import { Center, chakra, HStack, Input, StackProps, StepsTitle, Text, useSteps, VStack } from '@chakra-ui/react';
import { useMemo, useState, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { useTokenList } from '@/hooks/data/useTokenList';
import { StepsContent, StepsItem, StepsList, StepsNextTrigger, StepsRoot } from '@/components/ui/steps';
import { SwapInput, SwapWidget } from '@/components/widgets/swap/Swap';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { getPoolConfig, HOOK_CONTRACT_ADDRESS } from '@/app/(dashboard)/(trade)/swap/config';
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
import { queryPoolInfo } from '@/script/QuerySqrtPrice';
import { useTokenBalance } from '@/components/widgets/swap/hooks';
import { quoteAmmPrice } from '@/script/QuoteAmountOut';
import { calculateTickFromPrice } from './utils';

const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const POSITION_MANAGER_ADDRESS = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";
const POOL_MANAGER_ADDRESS = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";

const MotionVStack = motion.create(VStack);
const MotionStepContent = motion.create(StepsContent);

interface CreatePositionFormValues {
    token0: LocalToken;
    token1: LocalToken;
    token0Amount: string;
    token1Amount: string;
    slippage: string;
    minPrice: string;
    maxPrice: string;
}

const DEFAULT_FEE = 3000; // 0.30%
const DEFAULT_TICK_SPACING = 60;

interface CreatePositionFormProps extends StackProps {
}

export const CreatePositionForm: React.FC<CreatePositionFormProps> = ({ children, ...props }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const steps = useSteps({
        defaultStep: 1,
        count: 3,
        linear: true,
    })
    const [step, setStep] = useState(1)

    const { data: tokenList } = useTokenList();
    const { writeContractAsync } = useWriteContract();
    const { address: userAddress } = useAccount();
    const publicClient = usePublicClient();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { isLoading, errors }
    } = useForm<CreatePositionFormValues>({
        defaultValues: {
            slippage: "0.5"
        }
    });

    const onSubmit = async (data: CreatePositionFormValues) => {
        try {
            if (!data.token0 || !data.token1) {
                toaster.error({
                    title: "Lỗi tạo vị thế",
                    description: "Vui lòng chọn cả hai token.",
                });
                return;
            }

            const poolConfig = getPoolConfig(data.token0.address, data.token1.address);
            if (!poolConfig) {
                toaster.error({
                    title: "Lỗi tạo vị thế",
                    description: "Không tìm thấy pool cho token của bạn.",
                });
                return;
            }


            // First approve tokens to Permit2
            await writeContractAsync({
                address: data.token0.address as `0x${string}`,
                abi: ERC20_ABI.abi,
                functionName: "approve",
                args: [PERMIT2_ADDRESS as `0x${string}`, ethers.constants.MaxUint256],
            });

            await writeContractAsync({
                address: data.token1.address as `0x${string}`,
                abi: ERC20_ABI.abi,
                functionName: "approve",
                args: [PERMIT2_ADDRESS as `0x${string}`, ethers.constants.MaxUint256],
            });


            const MAX_UINT48 = "281474976710655"; // 2^48 - 1
            const MAX_UINT160 = "1461501637330902918203684832716283019655932542975";

            await writeContractAsync({
                address: PERMIT2_ADDRESS as `0x${string}`,
                abi: PERMIT2_ABI,
                functionName: "approve",
                args: [
                    data.token0.address,
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
                    data.token1.address,
                    POSITION_MANAGER_ADDRESS,
                    MAX_UINT160,
                    MAX_UINT48
                ],
            });

            if (!publicClient) {
                throw new Error("Public client not available");
            }

            const provider = new ethers.providers.Web3Provider(publicClient.transport);
            const { sqrtPriceX96, tick, liquidity } = await queryPoolInfo(data.token0.address, data.token1.address);

            const token0 = new UniswapToken(publicClient.chain.id, data.token0.address, data.token0.decimals, data.token0.symbol, data.token0.name);
            const token1 = new UniswapToken(publicClient.chain.id, data.token1.address, data.token1.decimals, data.token1.symbol, data.token1.name);

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

            const tickLower = calculateTickFromPrice(Number(data.minPrice));
            const tickUpper = calculateTickFromPrice(Number(data.maxPrice));

            // console.log(data.minPrice, data.maxPrice);

            console.log("tick: ", tickLower, tickUpper);

            const position = Position.fromAmounts({
                pool: pool,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0: parseUnits(data.token0Amount, data.token0.decimals).toString(),
                amount1: parseUnits(data.token1Amount, data.token1.decimals).toString(),
                useFullPrecision: true,
            });


            // slippage limits - add 1 wei to each amount
            const amount0Max = parseUnits(data.token0Amount, data.token0.decimals).add(1);
            const amount1Max = parseUnits(data.token1Amount, data.token1.decimals).add(1);

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
                title: "Position Creation Error",
                description: "Failed to create position. Please try again.",
            });
        }
    }

    const registers = {
        token0: register("token0", {
            required: "Vui lòng chọn token cung cấp",
        }),
        token1: register("token1", {
            required: "Vui lòng chọn token nhận",
        }),
        token0Amount: register("token0Amount", {
            required: "Vui lòng nhập số lượng token cung cấp",
            pattern: {
                value: /^\d+(\.\d+)?$/,
                message: "Số lượng không hợp lệ",
            },
        }),
        token1Amount: register("token1Amount", {
            required: "Vui lòng nhập số lượng token nhận",
            pattern: {
                value: /^\d+(\.\d+)?$/,
                message: "Số lượng không hợp lệ",
            },
        }),
    };

    const Step1 = useMemo(() => () => (
        <MotionVStack
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
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
                    name="token0"
                    control={control}
                    render={({ field }) => (
                        <SelectTokenDialog
                            title={field.value?.symbol}
                            triggerProps={{
                                size: "lg",
                                bg: field.value ? "bg.subtle" : "",
                                color: field.value ? "bg.inverted" : "",
                                flex: 1,
                                justifyContent: "space-between",
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
                    name="token1"
                    control={control}
                    render={({ field }) => (
                        <SelectTokenDialog
                            title={field.value?.symbol}
                            tokenList={tokenList || []}
                            placeholder="Chọn token nhận"
                            selectedToken={field.value}
                            triggerProps={{
                                size: "lg",
                                bg: field.value ? "bg.subtle" : "",
                                color: field.value ? "bg.inverted" : "",
                                flex: 1,
                                justifyContent: "space-between",
                            }}
                            onSelectToken={(token) => {
                                field.onChange(token);
                            }}
                        />
                    )}
                />
            </HStack>

            <VStack align="start" w="full" bg="bg.subtle" p={4} rounded="xl" gap={1}>
                <HStack w="full" justify="space-between">
                    <Text fontSize="sm" color="fg.default">Mức phí giao dịch</Text>
                    <Text fontSize="sm" color="fg.default">0,3%</Text>
                </HStack>
                <Text fontSize="sm" color="fg.subtle">Đây là phần trăm phí bạn sẽ nhận được khi có giao dịch</Text>
            </VStack>

            <StepsNextTrigger asChild>
                <Button
                    disabled={!watch("token0") || !watch("token1")}
                    w={"full"}
                    size={"lg"}
                    onClick={() => {
                        if (!watch("token0") || !watch("token1")) {
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
    ), [tokenList]);

    const Step2 = useMemo(() => () => {
        const token0 = watch("token0");
        const token1 = watch("token1");
        const [currentPrice, setCurrentPrice] = useState<number>(0);

        const poolConfig = token0 && token1 ? getPoolConfig(token0.address, token1.address) : null;
        
        // Determine the display order based on pool config
        const [displayToken0, displayToken1] = useMemo(() => {
            if (!poolConfig || !token0 || !token1) return [token0, token1];
            
            // Check if the tokens are in the same order as the pool
            if (token0.address.toLowerCase() === poolConfig.poolKey.currency0.toLowerCase()) {
                return [token0, token1];
            }
            // If not, swap them for display
            return [token1, token0];
        }, [poolConfig, token0, token1]);

        // Fetch current price and set default min/max prices when tokens change
        useEffect(() => {
            const fetchPrice = async () => {
                if (displayToken0 && displayToken1) {
                    try {
                        // Reset price fields when tokens change
                        setValue("minPrice", "");
                        setValue("maxPrice", "");

                        const amountOut = await quoteAmmPrice(displayToken0.address, displayToken1.address, 1);
                        const price = Number(amountOut);
                        setCurrentPrice(price);
                        
                        // Calculate default min and max prices (±30%)
                        const minPricePercentage = 0.7;  // 1 - 0.3 (-30%)
                        const maxPricePercentage = 1.3;  // 1 + 0.3 (+30%)
                        
                        const minPrice = price * minPricePercentage;
                        const maxPrice = price * maxPricePercentage;
                        
                        // Set the default values
                        setValue("minPrice", minPrice.toFixed(9));
                        setValue("maxPrice", maxPrice.toFixed(9));
                    } catch (error) {
                        console.error("Error fetching price:", error);
                        setCurrentPrice(0);
                        setValue("minPrice", "");
                        setValue("maxPrice", "");
                    }
                }
            };
            fetchPrice();
        }, [displayToken0, displayToken1, setValue]);

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
                    title="Đặt khoảng giá"
                    description="Chọn khoảng giá cho vị thế của bạn"
                />

                <VStack w="full" bg="bg.subtle" p={4} rounded="xl" gap={3}>
                    <HStack w="full" justify="space-between" align="center">
                        <Text fontSize="sm" color="fg.default">
                            Giá (1 {displayToken0?.symbol} = {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 9 })} {displayToken1?.symbol})
                        </Text>
                        <HStack gap={1}>
                            <chakra.img src={displayToken0?.logoURI} w="4" h="4" rounded="full" />
                            <chakra.img src={displayToken1?.logoURI} w="4" h="4" rounded="full" />
                            <Text fontSize="sm" color="fg.default">
                                {displayToken0?.symbol}/{displayToken1?.symbol}
                            </Text>
                        </HStack>
                    </HStack>

                    <HStack w="full" gap={4}>
                        <VStack flex={1} align="start">
                            <Text fontSize="sm" color="fg.subtle">Giá tối thiểu</Text>
                            <Input
                                {...register("minPrice", {
                                    required: "Vui lòng nhập giá tối thiểu",
                                    pattern: {
                                        value: /^\d+(\.\d+)?$/,
                                        message: "Giá không hợp lệ",
                                    },
                                })}
                                placeholder="0.00"
                                size="lg"
                            />
                        </VStack>
                        <VStack flex={1} align="start">
                            <Text fontSize="sm" color="fg.subtle">Giá tối đa</Text>
                            <Input
                                {...register("maxPrice", {
                                    required: "Vui lòng nhập giá tối đa",
                                    pattern: {
                                        value: /^\d+(\.\d+)?$/,
                                        message: "Giá không hợp lệ",
                                    },
                                })}
                                placeholder="0.00"
                                size="lg"
                            />
                        </VStack>
                    </HStack>
                </VStack>

                <StepsNextTrigger asChild>
                    <Button
                        disabled={!watch("minPrice") || !watch("maxPrice")}
                        w={"full"}
                        size={"lg"}
                    >
                        Tiếp tục
                    </Button>
                </StepsNextTrigger>
            </MotionVStack>
        );
    }, [watch("token0"), watch("token1")]);

    const Step3 = useMemo(() => () => {
        const token0 = watch("token0");
        const token1 = watch("token1");
        const { address: userAddress } = useAccount();

        const { data: token0Balance } = useTokenBalance(token0, userAddress);
        const { data: token1Balance } = useTokenBalance(token1, userAddress);

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
                    description={`Nhập số lượng ${token0?.symbol} và ${token1?.symbol} bạn muốn cung cấp`}
                />

                <VStack w={"full"} gap={"2"} pos={"relative"}>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <SwapInput
                                label="Token 0"
                                token={field.value}
                                amount={watch("token0Amount")}
                                balance={token0Balance}
                                onAmountChange={async (value) => {
                                    setValue("token0Amount", value);
                                    if (value && watch("token0")?.address && watch("token1")?.address) {
                                        const amountOut = await quoteAmmPrice(
                                            watch("token0").address,
                                            watch("token1").address,
                                            Number(value)
                                        );
                                        setValue("token1Amount", amountOut.toString());
                                    }
                                }}
                                tokenList={tokenList}
                                onTokenSelect={(token) => field.onChange(token)}
                                userAddress={userAddress}
                                balanceProps={{
                                    color: "fg.muted",
                                }}
                                w={"full"}
                                wrapperProps={{
                                    maxW: "full",
                                }}
                                selectTokenDialogProps={{
                                    triggerProps: {
                                        disabled: !!field.value,
                                        _disabled: {
                                            opacity: 1
                                        }
                                    }
                                }}
                            />
                        )}
                        {...registers.token0}
                    />
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <SwapInput
                                label="Token 1"
                                token={field.value}
                                amount={watch("token1Amount")}
                                balance={token1Balance}
                                onAmountChange={async (value) => {
                                    setValue("token1Amount", value);
                                    if (value && watch("token0")?.address && watch("token1")?.address) {
                                        const amountOut = await quoteAmmPrice(
                                            watch("token1").address,
                                            watch("token0").address,
                                            Number(value)
                                        );
                                        setValue("token0Amount", amountOut.toString());
                                    }
                                }}
                                tokenList={tokenList}
                                onTokenSelect={(token) => field.onChange(token)}
                                userAddress={userAddress}
                                balanceProps={{
                                    color: "fg.muted",
                                }}
                                wrapperProps={{
                                    maxW: "full",
                                }}
                                selectTokenDialogProps={{
                                    triggerProps: {
                                        disabled: !!field.value,
                                        _disabled: {
                                            opacity: 1
                                        }
                                    }
                                }}
                            />
                        )}
                        {...registers.token1}
                    />
                </VStack>
                <Button
                    loading={isLoading}
                    loadingText={"Đang tạo vị thế..."}
                    w={"full"}
                    size={"lg"}
                    type="submit"
                >
                    Tạo vị thế
                </Button>
            </MotionVStack>
        );
    }, [tokenList]);

    const stepRenders = [
        {
            title: "Chọn token",
            description: "Chọn token để tạo vị thế mới",
            content: <Step1 />
        },
        {
            title: "Đặt khoảng giá",
            description: "Chọn khoảng giá cho vị thế",
            content: <Step2 />
        },
        {
            title: "Số lượng token",
            description: "Chọn số lượng token cung cấp",
            content: <Step3 />
        }
    ];

    const isStep1Completed = !!(watch("token0") && watch("token1"));

    return (
        <StepsRoot
            colorPalette={"bg"}
            orientation={["horizontal", "horizontal", "vertical"]}
            defaultStep={0}
            count={stepRenders.length}
            linear={!isStep1Completed}
            onStepChange={(e) => setStep(e.step)}
        >
            <StepsList>
                {stepRenders.map((step, index) => (
                    <StepsItem
                        key={index}
                        index={index}
                        title={step.title}
                        description={step.description}
                    />
                ))}
            </StepsList>
            <AnimatePresence mode="wait">
                <Center flex={1} w={"full"} maxW={"lg"}>
                    <chakra.form w={"full"} h={"full"} onSubmit={handleSubmit(onSubmit)}>
                        {stepRenders.map((step, index) => (
                            <StepsContent
                                w={"full"}
                                key={index}
                                index={index}
                                data-state="open"
                                _open={{
                                    animation: "fade-in-up 300ms ease-out",
                                }}
                                _closed={{
                                    animation: "fade-in-out 300ms ease-in",
                                }}
                            >
                                {step.content}
                            </StepsContent>
                        ))}
                    </chakra.form>
                </Center>
            </AnimatePresence>
        </StepsRoot>
    );
};

const FormFieldTitle: React.FC<{ title: string, description?: string }> = ({ title, description }) => (
    <VStack align={"start"} w={"full"}>
        <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        {description && <Text fontSize="sm" color="fg.subtle">{description}</Text>}
    </VStack>
);