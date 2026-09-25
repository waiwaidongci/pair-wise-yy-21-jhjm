import { mockData } from "../mocks/seedData";
import { postJson } from "./http";
import type { RepairTicket } from "../types/RepairTicket";
import type { Crew } from "../types/Crew";

const endpoint = "/api/repair-ticket";

export interface PartActualPayload {
  id: number;
  actual_quantity: number;
}

export interface ConfirmRestorationPayload {
  restored_at?: string;
  parts: PartActualPayload[];
}

export interface PartCheck {
  usage_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  actual_quantity: number | null;
  usage_status: string;
  problem: "REJECTED" | "QTY_MISMATCH" | null;
}

export interface RestorationHandover {
  ticket: RepairTicket;
  crew: Crew | null;
  crew_matched: boolean;
  parts: PartCheck[];
  restored: boolean;
  released: boolean;
}

export async function listRepairTicket(): Promise<RepairTicket[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.repairTicket as unknown as RepairTicket[])];
}

export async function saveRepairTicket(payload: RepairTicket) {
  console.info("save RepairTicket", payload);
  return payload;
}

export async function fetchRestorationHandover(ticketId: number): Promise<RestorationHandover> {
  const res = await fetch(`${endpoint}/${ticketId}/handover`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? "handover failed");
  return data as RestorationHandover;
}

export async function confirmRestoration(ticketId: number, payload: ConfirmRestorationPayload): Promise<RestorationHandover> {
  return postJson<RestorationHandover>(`${endpoint}/${ticketId}/confirm-restoration`, payload);
}
