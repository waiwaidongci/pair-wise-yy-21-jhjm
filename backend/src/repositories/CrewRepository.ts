import { seed } from "../seed";
import type { Crew } from "../models/Crew";

const rows: Crew[] = seed.crew.map((row) => ({ ...row }));

export const crewRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id) ?? null,
  save: (row: Crew) => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = row;
    else rows.push(row);
    return row;
  }
};
