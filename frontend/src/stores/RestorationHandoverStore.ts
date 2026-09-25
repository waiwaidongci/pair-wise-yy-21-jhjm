import { defineStore } from "pinia";
import { listRestorationHandover } from "../api/RestorationHandover";
import type { RestorationHandover } from "../types/RestorationHandover";
import { loadSlice, saveSlice } from "../utils/persistence";

const SLICE = "restorationHandover";

export const useRestorationHandoverStore = defineStore("restorationHandover", {
  state: () => ({ rows: [] as RestorationHandover[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      const cached = loadSlice<RestorationHandover[]>(SLICE);
      this.rows = cached ?? (await listRestorationHandover());
      this.loading = false;
    },
    persist() {
      saveSlice(SLICE, this.rows);
    },
    append(record: RestorationHandover) {
      this.rows.push(record);
      this.persist();
    },
    nextId() {
      return this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    }
  }
});
