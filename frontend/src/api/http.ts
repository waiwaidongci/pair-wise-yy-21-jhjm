import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface ApiFailure {
  code?: string;
  message: string;
  details?: { parts?: Array<{ usage_id: number; part_code: string; part_name: string; quantity: number; actual_quantity: number | null }> } | null;
}

export class ApiError extends Error {
  constructor(
    public code: string | undefined,
    message: string,
    public details: ApiFailure["details"] = null
  ) {
    super(message);
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = (await res.json().catch(() => ({}))) as ApiFailure;
  if (!res.ok) {
    throw new ApiError(data.code, data.message ?? ERROR_MESSAGES.VALIDATION_FAILED, data.details ?? null);
  }
  return data as T;
}
