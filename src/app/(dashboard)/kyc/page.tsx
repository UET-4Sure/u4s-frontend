"use server";

import { Ekyc } from "./_components/EKyc";

export default async function Page() {
    const keysConfig = {
        TOKEN_KEY: process.env.VNPT_TOKEN_KEY,
        TOKEN_ID: process.env.VNPT_TOKEN_ID,
        ACCESS_TOKEN: process.env.VNPT_ACCESS_TOKEN,
    }

    if (!keysConfig.TOKEN_KEY || !keysConfig.TOKEN_ID || !keysConfig.ACCESS_TOKEN) {
        throw new Error("Missing VNPT keys configuration");
    }

    return (
        <>
            <Ekyc keysConfig={{
                tokenKey: keysConfig.TOKEN_KEY,
                tokenId: keysConfig.TOKEN_ID,
                accessToken: keysConfig.ACCESS_TOKEN
            }} />
        </>
    )
}