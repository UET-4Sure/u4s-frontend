'use client'

import { EkycSdkConfig } from '@/types/vnpt-sdk'
import { useEffect, useState, useRef, RefObject } from 'react'

interface EkycProps {
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

export function Ekyc({ onResult, onFinalResult }: EkycProps) {
    const callBackEndFlow = async (data: any) => {
        console.log('Final result:', data);
    }

    useEffect(() => {
        const dataConfig = {
            BACKEND_URL: "https://api.idg.vnpt.vn",
            TOKEN_KEY: "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI+amQCsMFWtrZl7/8VCvbqCgJVRqBlgsyXLjGeZuim5auq4yCcNbHXcx1digAHiVikgh9QjEiurTLns49QMfTMCAwEAAQ==",
            TOKEN_ID: "3612e972-8c2a-1a43-e063-63199f0a5acf",
            ACCESS_TOKEN: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMDk1N2Q1OC0zYTg1LTExZjAtOGFmYS1jNTBlOGZiNDg2NTUiLCJhdWQiOlsicmVzdHNlcnZpY2UiXSwidXNlcl9uYW1lIjoiaG9hbmdiYWNoMDk4NUBnbWFpbC5jb20iLCJzY29wZSI6WyJyZWFkIl0sImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0IiwibmFtZSI6ImhvYW5nYmFjaDA5ODVAZ21haWwuY29tIiwiZXhwIjoxNzQ4NzQ2NjQxLCJ1dWlkX2FjY291bnQiOiIzMDk1N2Q1OC0zYTg1LTExZjAtOGFmYS1jNTBlOGZiNDg2NTUiLCJhdXRob3JpdGllcyI6WyJVU0VSIl0sImp0aSI6IjgxMWJlN2Q0LTA1ZTItNDY5MC05ZmJkLTkyYjIwOWY3NDBlNCIsImNsaWVudF9pZCI6ImNsaWVudGFwcCJ9.y2pXfmnlto9loZ2XqpYFvCwdTH2_4Zd0RhR2DCjVqOYZiZcmdQCMCkcbBO4cqcknNsz9ajXw3lRV5Q12L26xnRm_D2qjrmz04g8aWprOWAcfC1NgfPxVrhssFbxPQZcRksRo3LpeObQinHZTmH5OWXRGGdKFlyaexmZYZVMtqhcZD3QYIal24oQCrRW1euV_bNmYmN8krREbLKH7gA_GN6Z0sVGSCpjdbcbmQHhXesRKB6_DDsFcuzkzRfqDwRrpRMQGW--BDgdrR4r-eTOvDWU-SpgoTvptymFyxXf91LWGkeBW1U73fhFK3n_Q6HtI6PdLD7gWgQTiK6xEElwMMw",
            CALL_BACK_END_FLOW: callBackEndFlow,
            CUSTOM_THEME: {
                PRIMARY_COLOR: '#FFA103',
                TEXT_COLOR_DEFAULT: '#280B05',
                BACKGROUND_COLOR: 'transparent',
            },
            LIST_TYPE_DOCUMENT: [-1, 5, 6, 7, 9],

        } satisfies EkycSdkConfig;

        if (window.SDK) {
            window.SDK.launch(dataConfig);
        }

    }, []);

    return (
        <div id="ekyc_sdk_intergrated" />
    )
}