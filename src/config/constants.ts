export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "__VERSION__";

export const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

export const AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID || "";
export const AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET || "";
export const AUTH_FACEBOOK_ID = process.env.AUTH_FACEBOOK_ID || "";
export const AUTH_FACEBOOK_SECRET = process.env.AUTH_FACEBOOK_SECRET || "";
export const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

export const API_URL = process.env.NEXT_PUBLIC_VINSWAP_API_URL as string;

export const QUOTER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QUOTER_CONTRACT_ADDRESS as `0x${string}`;
export const IDENTITY_SBT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_SBT_CONTRACT_ADDRESS as `0x${string}`;

export const ETHEREUM_TESTNET_EXPLORER_URL = process.env.NEXT_PUBLIC_ETHEREUM_TESTNET_EXPLORER_URL || "https://sepolia.etherscan.io";