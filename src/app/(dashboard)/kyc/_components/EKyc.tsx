'use client'

import { vinaswapApi } from '@/services/axios'
import { CreateKycApplicationBody, DocumentTypeMap, KycProfileResponse } from '@/types/core'
import { EkycResponse, EkycSdkConfig } from '@/types/vnpt-sdk'
import { chakra } from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useRef, RefObject } from 'react'
import { SubmitKycApplicationDialog } from './SubmitKycApplicationDialog'
import { toaster } from '@/components/ui/toaster'
import { useWatchContractEvent } from 'wagmi'
import { IDENTITY_SBT_CONTRACT_ADDRESS } from '@/config/constants'
import abis from "@/abis/IdentitySBT"
import { AxiosError } from 'axios'
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
    const [sbtTokenId, setSbtTokenId] = useState<string | null>();
    const [openProcessDialog, setOpenProcessDialog] = useState(false);

    const { mutate: submitKycApplication, isPending: isSubmiting } = useMutation({
        mutationKey: ['kyc:submit'],
        mutationFn: async (data: CreateKycApplicationBody) => {
            if (!address) {
                throw new Error('Not connected to a wallet');
            }

            const res = await vinaswapApi.post(`/users/wallet/${address}/kyc/applications`, data);

            return res.data as KycProfileResponse;
        },
        onSuccess: (data) => {
            setSbtTokenId(data.tokenId);
            queryClient.invalidateQueries({
                queryKey: ['kyc:status', address],
            });
            queryClient.invalidateQueries({
                queryKey: ["wallet", address],
            });

            toaster.success({
                title: 'Xác minh thành công',
                description: 'KYC của bạn đã được xác minh thành công',
            })
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    toaster.error({
                        title: 'Xác minh thất bại',
                        description: 'Không tìm thấy thông tin người dùng',
                    });
                    return;
                }
                if (error.response?.status === 404) {
                    toaster.warning({
                        title: 'Đã xác minh',
                        description: 'Bạn đã xác minh thành công và không cần xác minh lại',
                    });
                    return;
                }
            }
            toaster.error({
                title: 'Xác minh thất bại',
                description: error.message || 'Đã xảy ra lỗi khi xác minh KYC. Vui lòng thử lại sau.',
            });
        },
    });

    //WARNING: Đang bị đần
    // useWatchContractEvent({
    //     address: IDENTITY_SBT_CONTRACT_ADDRESS,
    //     eventName: 'Transfer',
    //     abi: abis,
    //     args: {
    //         from: '0x0000000000000000000000000000000000000000',
    //         to: address as `0x${string}`,
    //     },
    //     onLogs: (logs) => {
    //         if (logs.length > 0 && !isEventEmitted) {
    //             const sbtTokenId = logs[0].args.tokenId?.toString();
    //             if (sbtTokenId) {
    //                 setSbtTokenId(sbtTokenId);
    //                 setIsEventEmitted(true);
    //                 setIsProcessing(false);
    //             }
    //         }
    //     }
    // })
    const callBackEndFlow = async (data: EkycResponse) => {
        if (onResult) {
            onResult(data);
        }

        setOpenProcessDialog(true);

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
            <SubmitKycApplicationDialog
                open={openProcessDialog}
                onOpenChange={(value) => setOpenProcessDialog(value.open)}
                isProcessing={isSubmiting} sbtTokenId={sbtTokenId}
            />
        </>
    )
}