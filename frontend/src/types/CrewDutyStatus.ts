export const CrewDutyStatus = ["AVAILABLE", "BUSY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
