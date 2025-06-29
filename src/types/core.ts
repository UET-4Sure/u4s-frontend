import { DocumentType } from './vnpt-sdk';

export enum KycStatus {
    NONE = 'none',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export const DocumentTypeMap: Record<number, DocumentType> = {
    ["-1"]: DocumentType.ID_CARD,

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

export interface CreateKycApplicationBody {
    documentType: DocumentType;
    documentNumber: string;
    documentFrontImage: string;
    documentBackImage: string;
}

export interface KycProfileResponse {
    id: string;
    user: User;
    documentType: DocumentType;
    documentNumber: string;
    documentFrontImage: string | null;
    documentBackImage: string | null;

    verificationOutcome: KycStatus;
    reviewNotes: string | null;
    reviewedAt: Date | null;

    tokenId: string | null;

    createdAt: Date;
    updatedAt: Date;
}