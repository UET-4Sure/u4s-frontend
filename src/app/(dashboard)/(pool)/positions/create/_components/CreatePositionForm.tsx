"use client";

import { Button } from '@/components/ui/button';
import { SelectTokenDialog } from '@/components/widgets/components/SelectTokenDialog';
import { Token } from '@/components/widgets/type';
import { HStack, StackProps, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { TOKEN_LIST } from '../config';
import { motion } from 'framer-motion';

const MotionVStack = motion.create(VStack);

interface CreatePositionFormValues {
    fromToken: Token;
    toToken: Token;
    slippage: string;
}

interface CreatePositionFormProps extends StackProps {
}
export const CreatePositionForm: React.FC<CreatePositionFormProps> = ({ children, ...props }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreatePositionFormValues>({
    });

    const onSubmit = (data: CreatePositionFormValues) => {
        console.log("Form submitted with data:", data);
        // Handle form submission logic here
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            {
                currentStep === 1 && (
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
                                        tokenList={TOKEN_LIST}
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
                                        tokenList={TOKEN_LIST}
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
                        <Button
                            w={"full"}
                            onClick={() => setCurrentStep(2)}
                        >
                            Tiếp tục
                        </Button>
                    </MotionVStack>
                )
            }

        </form >
    );
};

const FormFieldTitle: React.FC<{ title: string, description?: string }> = ({ title, description }) => (
    <VStack align={"start"} w={"full"}>
        <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        {description && <Text fontSize="sm" color="fg.subtle">{description}</Text>}
    </VStack>
);