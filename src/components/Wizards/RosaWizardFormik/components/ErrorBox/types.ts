export type ErrorDetail = { kind: string; items?: any };

export type ErrorState = {
  pending: boolean;
  fulfilled: false;
  error: true;
  reason?: string;
  errorCode?: number;
  internalErrorCode?: string;
  errorMessage?: string;
  errorDetails?: ErrorDetail[];
  operationID?: string;
  message?: string;
};