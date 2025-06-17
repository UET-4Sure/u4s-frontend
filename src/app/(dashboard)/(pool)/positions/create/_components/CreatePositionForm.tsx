"use client";

import { Button } from '@/components/ui/button';
import { SelectTokenDialog } from '@/components/widgets/components/SelectTokenDialog';
import { Token } from '@/components/widgets/type';
import { HStack, Input, StackProps, StepsTitle, Text, useSteps, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { useTokenList } from '@/hooks/data/useTokenList';
import { StepsCompletedContent, StepsContent, StepsIndicator, StepsItem, StepsList, StepsNextTrigger, StepsRoot } from '@/components/ui/steps';
import { SwapWidget } from '@/components/widgets/swap/Swap';

const MotionVStack = motion.create(VStack);
const MotionStepContent = motion.create(StepsContent);

interface CreatePositionFormValues {
    fromToken: Token;
    toToken: Token;
    slippage: string;
}

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

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreatePositionFormValues>({
    });

    const onSubmit = async (data: CreatePositionFormValues) => {
        console.log("Form submitted with data:", data);

        steps.goToNextStep();
        // Handle form submission logic here
    }

    const Step1 = useMemo(() => () => (
        <MotionVStack
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            align={"start"}
            w={"full"}
        >
            <FormFieldTitle
                title="Tạo vị thế"
                description="Chọn token và nhập thông tin để tạo vị thế mới"
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
            <VStack w={"full"} align={"start"}>
                <FormFieldTitle
                    title="Bậc phí"
                    description="Chọn bậc phí cho vị thế của bạn. Bậc phí ảnh hưởng đến chi phí giao dịch và hiệu suất của vị thế."
                />
            </VStack>
            <StepsNextTrigger asChild>
                <Button
                    disabled={!watch("fromToken") || !watch("toToken")}
                    w={"full"}
                >
                    Tiếp tục
                </Button>
            </StepsNextTrigger>
        </MotionVStack >
    ), [tokenList, watch]);

    const Step2 = useMemo(() => () => (
        <MotionVStack
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            align={"start"}
            w={"full"}
        >
            <FormFieldTitle
                title="Thông tin vị thế"
                description="Nhập thông tin chi tiết cho vị thế của bạn."
            />
            <HStack w={"full"} align={"start"}>
                <VStack align={"start"} w={"full"}>
                    <Text fontSize="sm" color="fg.subtle">Slippage Tối đa</Text>
                    <Input
                        type="number"
                        placeholder="Nhập slippage tối đa"
                        {...register("slippage", {
                            required: "Slippage là bắt buộc",
                            min: {
                                value: 0,
                                message: "Slippage không thể âm"
                            },
                            max: {
                                value: 100,
                                message: "Slippage không thể lớn hơn 100%"
                            }
                        })}
                        defaultValue="1"
                        variant={"subtle"}
                        step="0.01"
                        min="0"
                        max="100"
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                setValue("slippage", value);
                            }
                        }}
                    />
                    {errors.slippage && <Text color="red.500">{errors.slippage.message}</Text>}
                </VStack>
            </HStack>
            <VStack>
                <FormFieldTitle
                    title='Nạp token'
                    description='Bạn có thể nạp token vào ví để sử dụng cho giao dịch này.'
                />
                <SwapWidget
                    defaultFromToken={watch("fromToken")}
                    defaultToToken={watch("toToken")}
                    swapButtonProps={{
                        hidden: true,
                    }}
                />
            </VStack>

            <StepsNextTrigger asChild>
                <Button
                    w={"full"}
                    colorPalette={"primary"}
                    type="submit"
                >
                    Tạo vị thế
                </Button>
            </StepsNextTrigger>
        </MotionVStack>
    ), [watch, errors]);

    const stepRenders = [
        {
            title: "Tạo vị thế",
            description: "Chọn token và nhập thông tin để tạo vị thế mới",
            content: <Step1 />
        },
        {
            title: "Thông tin vị thế",
            description: "Nhập thông tin chi tiết cho vị thế của bạn.",
            content: <Step2 />
        }
    ]

    const isStep1Completed = !!(watch("fromToken") && watch("toToken"));

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
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
        </form >
    );
};

const FormFieldTitle: React.FC<{ title: string, description?: string }> = ({ title, description }) => (
    <VStack align={"start"} w={"full"}>
        <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        {description && <Text fontSize="sm" color="fg.subtle">{description}</Text>}
    </VStack>
);