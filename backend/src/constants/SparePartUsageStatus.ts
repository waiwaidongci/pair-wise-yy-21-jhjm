export const SPARE_PART_USAGE_STATUS = ["PENDING", "APPROVED", "REJECTED", "CONSUMED"] as const;
export type SparePartUsageStatus = (typeof SPARE_PART_USAGE_STATUS)[number];
