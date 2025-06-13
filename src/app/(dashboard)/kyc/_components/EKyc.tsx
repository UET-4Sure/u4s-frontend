'use client'

import { vinaswapApi } from '@/services/axios'
import { CreateKycApplicationBody, DocumentTypeMap } from '@/types/core'
import { EkycResponse, EkycSdkConfig } from '@/types/vnpt-sdk'
import { chakra } from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useRef, RefObject } from 'react'
import { SubmitKycApplicationDialog } from './SubmitKycApplicationDialog'
import { toaster } from '@/components/ui/toaster'

interface EkycProps {
    keysConfig: {
        tokenKey: string
        tokenId: string
        accessToken: string;
    }
    onResult?: (data: any) => void
    onFinalResult?: (data: any) => void
}

declare global {
    interface Window {
        SDK?: {
            launch: (config: any) => void;
        }
    }
}

export function Ekyc({ keysConfig, onResult, onFinalResult }: EkycProps) {
    const { address } = useAppKitAccount();
    const queryClient = useQueryClient();

    const { mutate: submitKycApplication, isPending: isSubmiting } = useMutation({
        mutationKey: ['kyc:submit'],
        mutationFn: async (data: CreateKycApplicationBody) => {
            if (!address) {
                throw new Error('Not connected to a wallet');
            }

            await vinaswapApi.post(`/users/wallet/${address}/kyc/applications`, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['kyc:status', address],
            });
            toaster.success({
                title: 'Xác minh thành công',
                description: 'KYC của bạn đã được xác minh thành công. ID NFT sẽ được gửi đến ví của bạn.',
            })
        },
        onError: (error) => {
            console.error('Error submitting KYC:', error);
        },
    });
    const callBackEndFlow = async (data: EkycResponse) => {
        if (onResult) {
            onResult(data);
        }

        console.log('KYC Result:', data);
        submitKycApplication({
            documentType: DocumentTypeMap[data.type_document],
            documentNumber: data.ocr.object.id,
            documentBackImage: data.base64_doc_img.img_back,
            documentFrontImage: data.base64_doc_img.img_front,
        });

        if (onFinalResult) {
            onFinalResult(data);
        }

    }

    useEffect(() => {
        const modifiedConfig: EkycSdkConfig = {
            // KEYS
            TOKEN_KEY: keysConfig.tokenKey,
            TOKEN_ID: keysConfig.tokenId,
            ACCESS_TOKEN: keysConfig.accessToken,
            BACKEND_URL: "https://api.idg.vnpt.vn",

            LIST_TYPE_DOCUMENT: [-1, 5, 6, 7, 9],

            // ONLY FOR DEVELOPMENT
            ENABLE_API_LIVENESS_FACE: false,
            DOUBLE_LIVENESS: false,
            ENABLE_API_LIVENESS_DOCUMENT: true,

            // STYLE
            // CUSTOM_THEME: {
            //     PRIMARY_COLOR: '#FFA103',
            //     TEXT_COLOR_DEFAULT: '#280B05',
            //     BACKGROUND_COLOR: '#F6EED9',
            // },
            // HAS_BACKGROUND_IMAGE: false,

            // CALLBACKS
            CALL_BACK_END_FLOW: callBackEndFlow,
        };

        if (window.SDK) {
            window.SDK.launch(modifiedConfig);
        }

    }, []);

    return (
        <>
            <chakra.div id="ekyc_sdk_intergrated" w={"full"} />
            <SubmitKycApplicationDialog open={isSubmiting} />
        </>
    )
}