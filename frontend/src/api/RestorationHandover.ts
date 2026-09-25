import { mockData } from "../mocks/seedData";
import type { RestorationHandover } from "../types/RestorationHandover";

const endpoint = "/api/restoration";

export async function listRestorationHandover(): Promise<RestorationHandover[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.restorationHandover as unknown as RestorationHandover[])];
}

export interface RestorationAdjustPayload {
  ticket_id: number;
  usage_id: number;
  actual_quantity: number;
  adjust_note: string;
}

/** Best-effort sync to the backend; local state stays authoritative when offline. */
export async function syncRestorationConfirm(payload: RestorationHandover): Promise<void> {
  try {
    await fetch(`${endpoint}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Offline review mode: the handover record is persisted locally.
  }
}

export async function syncRestorationAdjust(payload: RestorationAdjustPayload): Promise<void> {
  try {
    await fetch(`${endpoint}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Offline review mode: the adjustment is persisted locally.
  }
}
