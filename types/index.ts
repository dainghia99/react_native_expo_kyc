export interface User {
  email: string;
  kyc_status: string;
}

export interface KYCVerificationResponse {
  message: string;
  blink_count?: number;
  liveness_score?: number;
}

export interface KYCStatusResponse {
  status: string;
}
