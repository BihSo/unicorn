/**
 * Type definitions for Unicorn Admin Dashboard
 * Matches backend DTOs for type safety
 */

// Startup development stages
export type StartupStage = 'IDEA' | 'MVP' | 'GROWTH' | 'SCALING';

// Startup status
export type StartupStatus = 'ACTIVE' | 'APPROVED';

// Startup interface (matches backend StartupResponse DTO)
export interface Startup {
    id: string;
    name: string;
    tagline?: string;
    fullDescription?: string;
    industry?: string;
    stage: StartupStage;
    fundingGoal?: number;
    raisedAmount: number;
    websiteUrl?: string;
    logoUrl?: string;
    pitchDeckUrl?: string;
    financialDocumentsUrl?: string;
    status: StartupStatus;
    ownerId: string;
    ownerEmail: string;
    createdAt: string;
    updatedAt?: string;
}

// Request to update startup status (admin)
export interface UpdateStartupStatusRequest {
    status: StartupStatus;
    rejectionReason?: string;
}

export interface StartupStats {
    total: number;
    active: number;
    pending: number;
    rejected: number;
}

export interface User {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
}
