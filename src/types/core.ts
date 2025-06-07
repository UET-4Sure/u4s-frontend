interface User {
    id: string;
    walletAddress: string;
    authMethod: string;
    kycStatus: string;
    bannedUntil: Date | null;
}

