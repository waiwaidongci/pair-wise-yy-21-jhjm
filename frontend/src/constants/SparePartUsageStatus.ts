export const SparePartUsageStatus = ["PENDING", "APPROVED", "REJECTED", "CONSUMED", "POST_RESTORE_ADJUST"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];
export const SparePartUsageStatusText: Record<SparePartUsageStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已批准",
  REJECTED: "已退回",
  CONSUMED: "已消耗",
  POST_RESTORE_ADJUST: "复电后补记"
};
