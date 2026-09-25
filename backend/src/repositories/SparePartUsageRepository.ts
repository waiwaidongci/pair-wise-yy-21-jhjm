import { seed } from "../seed";
import type { SparePartUsage } from "../models/SparePartUsage";

const rows: SparePartUsage[] = seed.sparePartUsage.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const sparePartUsageRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  findByTicket: (ticketId: number) => rows.filter((row) => row.ticket_id === ticketId),
  save: (row: Partial<SparePartUsage>) => {
    const entity = { ...row, id: row.id ?? nextId++ } as SparePartUsage;
    rows.push(entity);
    return entity;
  },
  update: (id: number, patch: Partial<SparePartUsage>) => {
    const entity = rows.find((row) => row.id === id);
    if (!entity) return undefined;
    Object.assign(entity, patch);
    return entity;
  }
};
