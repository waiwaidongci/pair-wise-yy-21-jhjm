import type { RepairTicket } from "../models/RepairTicket";
import type { SparePartUsage } from "../models/SparePartUsage";

export type PartCheckProblem = "REJECTED" | "QTY_MISMATCH" | null;

export const createPartCheckDto = (usage: SparePartUsage, problem: PartCheckProblem = null) => ({
  usage_id: usage.id,
  part_code: usage.part_code,
  part_name: usage.part_name,
  quantity: usage.quantity,
  actual_quantity: usage.actual_quantity,
  usage_status: usage.usage_status,
  problem
});

export const createRestorationHandoverDto = (overrides: Record<string, unknown> = {}) => ({
  ticket: null as RepairTicket | null,
  crew: null as unknown,
  crew_matched: false,
  parts: [] as ReturnType<typeof createPartCheckDto>[],
  restored: false,
  released: false,
  ...overrides
});
