export const SparePartUsageStatus = ["PENDING", "APPROVED", "REJECTED", "CONSUMED"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];
export const SparePartUsageStatusText: Record<SparePartUsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已批准",
  REJECTED: "已退回",
  CONSUMED: "已消耗"
};
