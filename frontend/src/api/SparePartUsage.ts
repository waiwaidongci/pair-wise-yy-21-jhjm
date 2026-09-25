import { mockData } from "../mocks/seedData";
import { postJson } from "./http";
import type { SparePartUsage } from "../types/SparePartUsage";
import type { RepairTicket } from "../types/RepairTicket";

const endpoint = "/api/spare-part-usage";

export interface AdjustUsagePayload {
  adjust_note: string;
  actual_quantity?: number;
}

export interface AdjustUsageResult {
  usage: SparePartUsage;
  ticket: RepairTicket;
}

export async function listSparePartUsage(): Promise<SparePartUsage[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.sparePartUsage as unknown as SparePartUsage[])];
}

export async function saveSparePartUsage(payload: SparePartUsage) {
  console.info("save SparePartUsage", payload);
  return payload;
}

export async function adjustSparePartUsage(usageId: number, payload: AdjustUsagePayload): Promise<AdjustUsageResult> {
  return postJson<AdjustUsageResult>(`${endpoint}/${usageId}/adjust`, payload);
}
