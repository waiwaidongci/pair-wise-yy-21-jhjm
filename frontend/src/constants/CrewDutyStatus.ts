export const CrewDutyStatus = ["AVAILABLE", "BUSY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
export const CrewDutyStatusText: Record<CrewDutyStatus, string> = {
  AVAILABLE: "可派",
  BUSY: "抢修中",
  OFF_DUTY: "休整"
};
