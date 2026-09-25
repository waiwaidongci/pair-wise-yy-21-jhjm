import { defineStore } from "pinia";
import { listRepairTicket } from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";
import { loadSlice, saveSlice } from "../utils/persistence";
import { ERROR_CODES } from "../constants/errorCodes";

const SLICE = "repairTicket";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({ rows: [] as RepairTicket[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      const cached = loadSlice<RepairTicket[]>(SLICE);
      this.rows = cached ?? (await listRepairTicket());
      this.loading = false;
    },
    persist() {
      saveSlice(SLICE, this.rows);
    },
    markRestored(id: number, restoredAt: string) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return null;
      row.status = "RESTORED";
      row.restored_at = restoredAt;
      this.persist();
      return row;
    },
    setStatus(id: number, status: string) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return { ok: false as const, code: ERROR_CODES.VALIDATION_FAILED };
      // 已复电工单不允许改回未复电状态。
      if (row.status === "RESTORED" && status !== "RESTORED") {
        return { ok: false as const, code: ERROR_CODES.TICKET_ALREADY_RESTORED };
      }
      row.status = status;
      this.persist();
      return { ok: true as const };
    }
  }
});
