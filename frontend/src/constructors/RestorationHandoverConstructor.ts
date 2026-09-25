import type { RestorationHandover } from "../types/RestorationHandover";

export const createDefaultRestorationHandover = (overrides: Partial<RestorationHandover> = {}): RestorationHandover => ({
  id: 1 as never,
  ticket_id: 1 as never,
  restored_at: "" as never,
  operator: "调度员" as never,
  parts: [] as never,
  crew_id: 0 as never,
  crew_name: "" as never,
  crew_released: false as never,
  released_at: "" as never,
  ...overrides
});

export const createRestorationHandoverForm = createDefaultRestorationHandover;
export const createRestorationHandoverResponse = createDefaultRestorationHandover;
