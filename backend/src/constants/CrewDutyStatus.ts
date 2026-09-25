export const CrewDutyStatus = ["AVAILABLE", "BUSY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
export const CrewReleaseResult = ["RELEASED", "NOT_RELEASED"] as const;
export type CrewReleaseResult = (typeof CrewReleaseResult)[number];
