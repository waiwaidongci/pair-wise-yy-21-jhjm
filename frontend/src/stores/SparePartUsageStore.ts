import { defineStore } from "pinia";
import { listSparePartUsage } from "../api/SparePartUsage";
import type { SparePartUsage } from "../types/SparePartUsage";
import { loadSlice, saveSlice } from "../utils/persistence";

const SLICE = "sparePartUsage";

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({ rows: [] as SparePartUsage[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      const cached = loadSlice<SparePartUsage[]>(SLICE);
      this.rows = cached ?? (await listSparePartUsage());
      this.loading = false;
    },
    persist() {
      saveSlice(SLICE, this.rows);
    },
    /** 复电前由补记人登记实际用量。 */
    updateActual(id: number, actualQuantity: number) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return null;
      row.actual_quantity = actualQuantity;
      this.persist();
      return row;
    },
    markConsumed(ids: number[]) {
      this.rows.forEach((row) => {
        if (ids.includes(row.id)) row.usage_status = "CONSUMED";
      });
      this.persist();
    },
    /** 复电后补记：只允许改写实耗并留下调整说明。 */
    applyAdjustment(id: number, actualQuantity: number, adjustNote: string) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return null;
      row.actual_quantity = actualQuantity;
      row.adjust_note = adjustNote;
      this.persist();
      return row;
    }
  }
});
