import { defineStore } from "pinia";
import { listRepairTicket, confirmRestoration, type ConfirmRestorationPayload, type RestorationHandover } from "../api/RepairTicket";
import { ApiError } from "../api/http";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({
    rows: [] as Awaited<ReturnType<typeof listRepairTicket>>,
    loading: false,
    confirming: false,
    lastHandover: null as RestorationHandover | null,
    lastError: null as ApiError | null
  }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listRepairTicket();
      this.loading = false;
    },
    async confirm(ticketId: number, payload: ConfirmRestorationPayload) {
      this.confirming = true;
      this.lastError = null;
      try {
        this.lastHandover = await confirmRestoration(ticketId, payload);
        return this.lastHandover;
      } catch (err) {
        this.lastError = err instanceof ApiError ? err : new ApiError(undefined, String(err));
        throw this.lastError;
      } finally {
        this.confirming = false;
      }
    }
  }
});
