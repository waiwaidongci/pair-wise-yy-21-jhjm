export const SparePartUsageStatus = ["PENDING", "APPROVED", "REJECTED", "CONSUMED", "POST_RESTORE_ADJUST"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];
