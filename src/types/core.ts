export enum KycStatus {
    NONE = 'none',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface User {
    id: string;
    walletAddress: string;
    authMethod: string;
    kycStatus: KycStatus;
    bannedUntil: Date | null;
}

export interface AuthLoginResponse {
    token: string;
    user: User;
}