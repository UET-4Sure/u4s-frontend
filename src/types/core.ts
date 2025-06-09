enum KycStatus {
    NONE = 'none',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

interface User {
    id: string;
    walletAddress: string;
    authMethod: string;
    kycStatus: KycStatus;
    bannedUntil: Date | null;
}

interface AuthLoginResponse {
    token: string;
    user: User;
}