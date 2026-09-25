export const CREW_DUTY_STATUS = ["AVAILABLE", "BUSY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CREW_DUTY_STATUS)[number];
