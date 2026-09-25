import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";

const rows: RepairTicket[] = seed.repairTicket.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const repairTicketRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: Partial<RepairTicket>) => {
    const entity = { ...row, id: row.id ?? nextId++ } as RepairTicket;
    rows.push(entity);
    return entity;
  },
  update: (id: number, patch: Partial<RepairTicket>) => {
    const entity = rows.find((row) => row.id === id);
    if (!entity) return undefined;
    Object.assign(entity, patch);
    return entity;
  }
};
