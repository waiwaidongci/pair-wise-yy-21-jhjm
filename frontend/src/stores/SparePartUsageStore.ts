import { defineStore } from "pinia";
import { listSparePartUsage, adjustSparePartUsage, type AdjustUsagePayload, type AdjustUsageResult } from "../api/SparePartUsage";

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({
    rows: [] as Awaited<ReturnType<typeof listSparePartUsage>>,
    loading: false,
    adjusting: false
  }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listSparePartUsage();
      this.loading = false;
    },
    async adjust(usageId: number, payload: AdjustUsagePayload): Promise<AdjustUsageResult> {
      this.adjusting = true;
      try {
        return await adjustSparePartUsage(usageId, payload);
      } finally {
        this.adjusting = false;
      }
    }
  }
});
