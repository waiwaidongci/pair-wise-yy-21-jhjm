export const CrewDutyStatus = ["AVAILABLE", "BUSY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
export const CrewDutyStatusText: Record<CrewDutyStatus, string> = {
  AVAILABLE: "可派",
  BUSY: "抢修中",
  OFF_DUTY: "休息"
};
export const CrewReleaseResult = ["RELEASED", "NOT_RELEASED"] as const;
export type CrewReleaseResult = (typeof CrewReleaseResult)[number];
export const CrewReleaseResultText: Record<CrewReleaseResult, string> = {
  RELEASED: "已释放",
  NOT_RELEASED: "未释放"
};
