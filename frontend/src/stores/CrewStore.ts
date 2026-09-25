import { defineStore } from "pinia";
import { listCrew } from "../api/Crew";
import type { Crew } from "../types/Crew";
import { loadSlice, saveSlice } from "../utils/persistence";

const SLICE = "crew";

export const useCrewStore = defineStore("crew", {
  state: () => ({ rows: [] as Crew[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      const cached = loadSlice<Crew[]>(SLICE);
      this.rows = cached ?? (await listCrew());
      this.loading = false;
    },
    persist() {
      saveSlice(SLICE, this.rows);
    },
    applyRelease(id: number) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return null;
      row.current_ticket_id = 0;
      row.duty_status = "AVAILABLE";
      this.persist();
      return row;
    }
  }
});
