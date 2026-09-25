import { seed } from "../seed";
import type { Crew } from "../models/Crew";

const rows: Crew[] = seed.crew.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const crewRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: Partial<Crew>) => {
    const entity = { ...row, id: row.id ?? nextId++ } as Crew;
    rows.push(entity);
    return entity;
  },
  update: (id: number, patch: Partial<Crew>) => {
    const entity = rows.find((row) => row.id === id);
    if (!entity) return undefined;
    Object.assign(entity, patch);
    return entity;
  }
};
