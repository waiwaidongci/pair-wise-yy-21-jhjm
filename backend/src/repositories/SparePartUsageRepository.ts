import { seed } from "../seed";
import type { SparePartUsage } from "../models/SparePartUsage";

const rows: SparePartUsage[] = seed.sparePartUsage.map((row) => ({ ...row }));

export const sparePartUsageRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id) ?? null,
  findByTicket: (ticketId: number) => rows.filter((row) => row.ticket_id === ticketId),
  save: (row: SparePartUsage) => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = row;
    else rows.push(row);
    return row;
  }
};
