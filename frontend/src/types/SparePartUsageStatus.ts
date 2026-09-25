export const SparePartUsageStatus = ["PENDING", "APPROVED", "REJECTED", "CONSUMED"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];
