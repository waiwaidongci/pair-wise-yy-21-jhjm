import type { RestorationHandover } from "../models/RestorationHandover";

export const createRestorationDto = (overrides: Partial<RestorationHandover> = {}): RestorationHandover => ({
  id: 0,
  ticket_id: 0,
  restored_at: "",
  operator: "dispatcher",
  parts: [],
  crew_id: 0,
  crew_name: "",
  crew_released: false,
  released_at: "",
  ...overrides
});
