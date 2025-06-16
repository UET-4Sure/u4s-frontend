"use client";

import { Button } from '@/components/ui/button';
import { SelectTokenDialog } from '@/components/widgets/components/SelectTokenDialog';
import { Token } from '@/components/widgets/type';
import { HStack, StackProps, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { TOKEN_LIST } from '../config';

interface CreatePositionFormValues {
    fromToken: Token;
    toToken: Token;
    slippage: string;
}

interface CreatePositionFormProps extends StackProps {
}
export const CreatePositionForm: React.FC<CreatePositionFormProps> = ({ children, ...props }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreatePositionFormValues>({
    });

    const onSubmit = (data: CreatePositionFormValues) => {
        console.log("Form submitted with data:", data);
        // Handle form submission logic here
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <VStack {...props}>
                <VStack align={"start"} w={"full"}>
                    <Text fontSize="2xl" fontWeight="bold">Tạo vị thế</Text>
                    <Text fontSize="sm" color="fg.muted">Chọn token bạn muốn cung cấp thanh khoản</Text>
                </VStack>
                <HStack align={"start"} w={"full"}>
                    <Controller
                        name="fromToken"
                        control={control}
                        render={({ field }) => (
                            <SelectTokenDialog
                                title={field.value?.symbol}
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
                            />
                        )}
                    />
                </HStack>
                <Button
                    type='submit'>
                    Tạo vị thế
                </Button>
            </VStack>
        </form>
    );
};