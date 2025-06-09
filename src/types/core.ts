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

export enum DocumentType {
    PASSPORT = 'PASSPORT',
    ID_CARD = 'ID_CARD',
    DRIVER_LICENSE = 'DRIVER_LICENSE',
}

export interface CreateKycApplicationBody {
    documentType: DocumentType;
    documentNumber: string;
    documentFrontImageUrl: string;
    documentBackImageUrl: string;
    walletAddress: string;
}