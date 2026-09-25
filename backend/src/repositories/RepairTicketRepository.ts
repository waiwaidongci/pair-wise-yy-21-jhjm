import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";

const rows: RepairTicket[] = seed.repairTicket.map((row) => ({ ...row }));

export const repairTicketRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id) ?? null,
  save: (row: RepairTicket) => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = row;
    else rows.push(row);
    return row;
  }
};
