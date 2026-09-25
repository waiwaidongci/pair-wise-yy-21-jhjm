import { seed } from "../seed";
import type { RestorationHandover } from "../models/RestorationHandover";

const rows: RestorationHandover[] = seed.restorationHandover.map((row) => ({ ...row, parts: row.parts.map((part) => ({ ...part })) }));

export const restorationRepository = {
  findAll: () => rows,
  findByTicket: (ticketId: number) => rows.find((row) => row.ticket_id === ticketId) ?? null,
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: RestorationHandover) => {
    rows.push(row);
    return row;
  }
};
