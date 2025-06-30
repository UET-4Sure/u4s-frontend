"use client";

import { Button } from '@/components/ui/button';
import { SelectTokenDialog } from '@/components/widgets/components/SelectTokenDialog';
import { Box, Center, chakra, HStack, Input, StackProps, StepsTitle, Text, useSteps, VStack } from '@chakra-ui/react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Controller, FormProvider, SubmitHandler, useForm, useFormContext, useWatch } from 'react-hook-form';
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
import * as utils from './utils';
import { checkHasSBT } from '@/script/CheckHasSBT';
import { NumericFormat } from 'react-number-format';
import numeral from 'numeral';
import { Tag } from '@/components/ui/tag';
import { Tooltip } from '@/components/ui/tooltip';
import { RequireKycApplicationDialog } from '@/app/(dashboard)/_components/RequireKycApplicationDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DEFAULT_FEE = 3000; // 0.30%
const DEFAULT_TICK_SPACING = 60;
const MAX_VALUE_TO_CREATE_POSITION = 1000000; // 1,000,000 USD
const MAX_VALUE_TO_CREATE_POSITION_NO_KYC = 500; // 500 USD
const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
const POSITION_MANAGER_ADDRESS = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";

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

interface CreatePositionFormProps extends StackProps {
}

// Helper functions
const showErrorToast = (description: string) => {
    toaster.error({
        title: "Lỗi",
        description,
    });
};

const showSuccessToast = (description: string) => {
    toaster.success({
        title: "Thành công",
        description,
    });
};

const validateTokenSelection = (token0: LocalToken, token1: LocalToken) => {
    if (!token0 || !token1) {
        showErrorToast("Chọn đủ 2 token.");
        return false;
    }
    return true;
};

export const CreatePositionForm: React.FC<CreatePositionFormProps> = ({ children, ...props }) => {
    const steps = useSteps({
        defaultStep: 1,
        count: 3,
        linear: true,
    })

    const { data: tokenList } = useTokenList();
    const { writeContractAsync } = useWriteContract();
    const { address: userAddress } = useAccount();
    const publicClient = usePublicClient();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1)
    const [openRequireKycDialog, setOpenRequireKycDialog] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const sourceRef = useRef<'token0' | 'token1'>('token0');

    const methods = useForm<CreatePositionFormValues>({
        defaultValues: {
            slippage: "0.5"
        }
    });
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { isSubmitting, errors },
    } = methods;

    const token0 = useWatch({ control, name: "token0" });
    const token1 = useWatch({ control, name: "token1" });
    const token0Amount = useWatch({ control, name: "token0Amount" });
    const token1Amount = useWatch({ control, name: "token1Amount" });


    const { data: tradeVolume } = useQuery({
        queryKey: ['trade-volume', token0?.address, token0Amount, token1?.address, token1Amount],
        queryFn: async () => {
            return await utils.calculateVolumeLiquidity(
                token0.address,
                Number(token0Amount),
                token1.address,
                Number(token1Amount)
            );
        },
        enabled: !!token0Amount && !!token1Amount && !!token0 && !!token1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })

    const onSubmit = async (data: CreatePositionFormValues) => {
        try {
            if (!validateTokenSelection(data.token0, data.token1)) return;

            // Calculate total volume in USD
            const totalVolume = await utils.calculateVolumeLiquidity(
                data.token0.address,
                Number(data.token0Amount),
                data.token1.address,
                Number(data.token1Amount)
            );

            // Check if volume exceeds 1M USD
            if (totalVolume > MAX_VALUE_TO_CREATE_POSITION) {
                showErrorToast("Vượt quá 1.000.000 USD.");
                return;
            }

            // Check if volume > 500 USD and requires KYC
            if (totalVolume > MAX_VALUE_TO_CREATE_POSITION_NO_KYC) {
                const hasSBT = await checkHasSBT(userAddress as string);
                if (!hasSBT) {
                    setOpenRequireKycDialog(true);
                    return;
                }
            }

            const poolConfig = getPoolConfig(data.token0.address, data.token1.address);
            if (!poolConfig) {
                showErrorToast("Không tìm thấy pool.");
                return;
            }


            // First approve tokens to position manager
            await writeContractAsync({
                address: data.token0.address as `0x${string}`,
                abi: ERC20_ABI.abi,
                functionName: "approve",
                args: [POSITION_MANAGER_ADDRESS as `0x${string}`, parseUnits(data.token0Amount, data.token0.decimals).toString()],
            });

            await writeContractAsync({
                address: data.token1.address as `0x${string}`,
                abi: ERC20_ABI.abi,
                functionName: "approve",
                args: [POSITION_MANAGER_ADDRESS as `0x${string}`, parseUnits(data.token1Amount, data.token1.decimals).toString()],
            });


            const MAX_UINT48 = "281474976710655"; // 2^48 - 1
            const MAX_UINT160 = "1461501637330902918203684832716283019655932542975";

            // await writeContractAsync({
            //     address: PERMIT2_ADDRESS as `0x${string}`,
            //     abi: PERMIT2_ABI,
            //     functionName: "approve",
            //     args: [
            //         data.token0.address,
            //         POSITION_MANAGER_ADDRESS,
            //         MAX_UINT160,
            //         MAX_UINT48
            //     ],
            // });

            // await writeContractAsync({
            //     address: PERMIT2_ADDRESS as `0x${string}`,
            //     abi: PERMIT2_ABI,
            //     functionName: "approve",
            //     args: [
            //         data.token1.address,
            //         POSITION_MANAGER_ADDRESS,
            //         MAX_UINT160,
            //         MAX_UINT48
            //     ],
            // });

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

            const tickLower = utils.calculateTickFromPrice(Number(data.minPrice));
            const tickUpper = utils.calculateTickFromPrice(Number(data.maxPrice));

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

            queryClient.invalidateQueries({
                queryKey: ['token-balance', data.token0.address, userAddress],
            });

            queryClient.invalidateQueries({
                queryKey: ['token-balance', data.token1.address, userAddress],
            });

            showSuccessToast("Tạo vị thế thành công.");

            steps.goToNextStep();
        } catch (error) {
            console.error("Error creating position:", error);
            showErrorToast("Tạo vị thế thất bại.");
        }
    }

    const registers = {
        token0: register("token0", {
            required: "Chọn token cung cấp",
        }),
        token1: register("token1", {
            required: "Chọn token nhận",
        }),
        token0Amount: register("token0Amount", {
            required: "Nhập số lượng token",
            pattern: {
                value: /^\d+(\.\d+)?$/,
                message: "Số lượng không hợp lệ",
            },
        }),
        token1Amount: register("token1Amount", {
            required: "Nhập số lượng token",
            pattern: {
                value: /^\d+(\.\d+)?$/,
                message: "Số lượng không hợp lệ",
            },
        }),
    };

    const Step1 = () => {
        const token0 = useWatch({ control, name: "token0" });
        const token1 = useWatch({ control, name: "token1" });

        return (
            <MotionVStack
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

                <VStack align="start" w="full" bg="bg.subtle" shadow={"md"} p={4} rounded="2xl" gap={1}>
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
                            if (!validateTokenSelection(token0, token1)) return;
                        }}
                    >
                        Tiếp tục
                    </Button>
                </StepsNextTrigger>
            </MotionVStack >
        )
    }

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
            <>
                <RequireKycApplicationDialog open={openRequireKycDialog} onOpenChange={(value) => setOpenRequireKycDialog(value.open)} />
                <MotionVStack
                    align={"start"}
                    w={"full"}
                    gap={4}
                >
                    <FormFieldTitle
                        title="Đặt khoảng giá"
                        description="Chọn khoảng giá cho vị thế của bạn"
                    />
                    <Box w="full" bg="bg.subtle" p={"4"} rounded="2xl" shadow={"md"}>
                        <HStack gap={"2"}>
                            <Box position="relative" w="6" h="6" rounded="full" overflow="hidden" rotate={"15deg"}>
                                <Box w="46%" position={"absolute"} overflow={"hidden"} h="6">
                                    <Box w={"6"} h={"6"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                        <chakra.img
                                            src={displayToken0?.logoURI}
                                            alt="Token 0"
                                            objectFit={"fill"}
                                            pointerEvents={"none"}
                                        />
                                    </Box>
                                </Box>
                                <Box w="46%" right={"0"} position={"absolute"} overflow={"hidden"} h="6" zIndex={1}>
                                    <Box w={"6"} h={"6"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                        <chakra.img
                                            src={displayToken1?.logoURI}
                                            alt="Token 0"
                                            objectFit={"fill"}
                                            transform={"translateX(-50%)"}
                                            pointerEvents={"none"}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Text fontSize="md" color="fg" fontWeight="semibold">
                                {displayToken0?.symbol} / {displayToken1?.symbol}
                            </Text>
                            <Tooltip
                                openDelay={0}
                                closeDelay={100}
                                content={"Phí giao dịch"}
                            >
                                <Tag variant={"solid"} colorPalette={"secondary"}>
                                    0.3%
                                </Tag>
                            </Tooltip>
                        </HStack>
                    </Box>
                    <VStack w="full" bg="bg.subtle" p={4} rounded="2xl" shadow={"md"} gap={3}>
                        <HStack w="full" justify="space-between" align="center">
                            <Text fontSize="sm" color="fg.default">
                                {/* Giá (1 {displayToken0?.symbol} = {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 9 })} {displayToken1?.symbol}) */}
                                1 {displayToken0?.symbol} = {numeral(currentPrice).format('0,0.[000000000]')} {displayToken1?.symbol}
                            </Text>
                        </HStack>

                        <HStack w="full" gap={"4"}>
                            <VStack flex={1} align="start">
                                <Text fontSize="sm" color="fg.subtle">Giá tối thiểu</Text>
                                <Controller
                                    name="minPrice"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            inputMode="decimal"
                                            value={numeral(field.value).format('0,0.[000000000]')}
                                            onValueChange={(value) => { field.onChange(value.value) }}
                                            thousandSeparator
                                            allowNegative={false}
                                            decimalScale={token0?.decimals || 18}
                                            allowLeadingZeros={false}
                                            placeholder="0.0"
                                            allowedDecimalSeparators={[".", ","]}

                                            // UI
                                            rounded={"lg"}
                                            customInput={Input}
                                            variant={"subtle"}
                                            _placeholder={{ color: "fg.muted" }}
                                        />
                                    )}
                                />
                            </VStack>
                            <VStack flex={1} align="start">
                                <Text fontSize="sm" color="fg.subtle">Giá tối đa</Text>
                                <Controller
                                    name="maxPrice"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            inputMode="decimal"
                                            value={numeral(field.value).format('0,0.[000000000]')}
                                            onValueChange={(value) => { field.onChange(value.value) }}
                                            thousandSeparator
                                            allowNegative={false}
                                            decimalScale={token1?.decimals || 18}
                                            allowLeadingZeros={false}
                                            placeholder="0.0"
                                            allowedDecimalSeparators={[".", ","]}

                                            // UI
                                            customInput={Input}
                                            rounded={"lg"}
                                            variant={"subtle"}
                                            _placeholder={{ color: "fg.muted" }}
                                        />
                                    )}
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
            </>
        );
    }, [watch("token0"), watch("token1")]);



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
            content: <Step3
                tokenList={tokenList || []}
                registers={registers}
                tradeVolume={tradeVolume}
                isCalculating={isCalculating}
                setIsCalculating={setIsCalculating}
            />
        }
    ];

    const isStep1Completed = !!(watch("token0") && watch("token1"));

    return (
        <FormProvider
            {...methods}
        >
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
            <RequireKycApplicationDialog
                open={openRequireKycDialog}
                onOpenChange={(value) => setOpenRequireKycDialog(value.open)}
            />
        </FormProvider>
    );
};

const FormFieldTitle: React.FC<{ title: string, description?: string }> = ({ title, description }) => (
    <VStack align={"start"} w={"full"}>
        <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        {description && <Text fontSize="sm" color="fg.subtle">{description}</Text>}
    </VStack>
);

const Step3 = ({
    tokenList,
    registers,
    tradeVolume,
    isCalculating,
    setIsCalculating,
}: {
    tokenList: LocalToken[];
    registers: any;
    tradeVolume: number | undefined;
    isCalculating: boolean;
    setIsCalculating: (value: boolean) => void;
}) => {
    const {
        control,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useFormContext();

    const { address } = useAccount();
    const sourceRef = useRef<'token0' | 'token1'>('token0');

    const token0 = useWatch({ control, name: "token0" });
    const token1 = useWatch({ control, name: "token1" });
    const token0Amount = useWatch({ control, name: "token0Amount" });
    const token1Amount = useWatch({ control, name: "token1Amount" });
    const { data: token0Balance } = useTokenBalance(token0?.address, address);
    const { data: token1Balance } = useTokenBalance(token1?.address, address);

    const getButtonState = () => {
        if (isCalculating) return { text: "Đang tính toán...", isDisabled: true };
        if (isSubmitting) return { text: "Đang tạo vị thế...", isDisabled: true };
        return { text: "Tạo vị thế", isDisabled: false };
    };

    const calculateTokenAmount = async (fromToken: string, toToken: string, amount: string, targetField: string) => {
        setIsCalculating(true);
        try {
            const amountOut = await quoteAmmPrice(fromToken, toToken, Number(amount));
            setValue(targetField, amountOut.toString());
        } catch (error) {
            console.error("Error calculating amount:", error);
            setValue(targetField, "");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleToken0InputChange = (value: string) => {
        setValue("token0Amount", value);
        if (sourceRef.current === 'token0') {
            calculateTokenAmount(token0.address, token1.address, value, "token1Amount");
        }
    };

    const handleToken1InputChange = (value: string) => {
        setValue("token1Amount", value);
        if (sourceRef.current === 'token1') {
            calculateTokenAmount(token1.address, token0.address, value, "token0Amount");
        }
    };

    const ErrorMessageText = useMemo(() => () => {
        return (
            <>
                {tradeVolume! > MAX_VALUE_TO_CREATE_POSITION && (
                    <Box
                        data-state="open"
                        _open={{
                            animation: "fade-in-up 300ms ease-out",
                        }}
                        _closed={{
                            animation: "fade-in-out 300ms ease-in",
                        }}
                        w={"full"} bg="red.700" p={3} rounded="2xl" shadow={"md"}>
                        <Text w={"full"} color="red.contrast" fontSize="sm">
                            Vượt quá 1.000.000 USD.
                        </Text>
                    </Box>
                )}
            </>
        )
    }, [tradeVolume]);

    return (
        <MotionVStack
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
                            amount={token0Amount}
                            balance={token0Balance}
                            onAmountChange={handleToken0InputChange}
                            tokenList={tokenList}
                            onTokenSelect={(token) => field.onChange(token)}
                            userAddress={address}
                            inputProps={{
                                onInput: () => { sourceRef.current = 'token0'; }
                            }}
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
                    {...registers.token0}
                />
                <Controller
                    control={control}
                    render={({ field }) => (
                        <SwapInput
                            label="Token 1"
                            token={field.value}
                            amount={token1Amount}
                            balance={token1Balance}
                            onAmountChange={handleToken1InputChange}
                            tokenList={tokenList}
                            onTokenSelect={(token) => field.onChange(token)}
                            userAddress={address}
                            inputProps={{
                                onInput: () => { sourceRef.current = 'token1'; }
                            }}
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
                {/* /error message */}
                <ErrorMessageText />

            </VStack>
            <Button
                w={"full"}
                type="submit"
                size={"lg"}
                loading={isSubmitting || isCalculating}
                loadingText={getButtonState().text}
                disabled={getButtonState().isDisabled}
            >
                {getButtonState().text}
            </Button>
        </MotionVStack>
    );
};