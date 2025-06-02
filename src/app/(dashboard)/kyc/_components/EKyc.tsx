'use client'

import { EkycSdkConfig } from '@/types/vnpt-sdk'
import { useEffect, useState, useRef, RefObject } from 'react'

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
    const callBackEndFlow = async (data: any) => {
        if (onResult) {
            onResult(data);
        }

        if (data?.status === 'success') {
            if (onFinalResult) {
                onFinalResult(data);
            }
        } else {
            console.error('Error in EKYC flow:', data);
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
        <div id="ekyc_sdk_intergrated" />
    )
}