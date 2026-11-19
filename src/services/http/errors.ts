import type { ApiErrorPayload } from "@/types";

export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "HttpError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}
