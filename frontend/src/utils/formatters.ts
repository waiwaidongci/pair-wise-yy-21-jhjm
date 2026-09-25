import { SparePartUsageStatusText, type SparePartUsageStatus } from "../constants/SparePartUsageStatus";
import { CrewDutyStatusText, CrewReleaseResultText, type CrewDutyStatus, type CrewReleaseResult } from "../constants/CrewDutyStatus";
import { TicketStatusZh, type TicketStatus } from "../constants/TicketStatus";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatDateOrDash = (value: string | null) => (value ? formatDate(value) : "—");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatTicketStatus = (value: string) => TicketStatusZh[value as TicketStatus] ?? formatStatus(value);
export const formatUsageStatus = (value: string) => SparePartUsageStatusText[value as SparePartUsageStatus] ?? formatStatus(value);
export const formatDutyStatus = (value: string) => CrewDutyStatusText[value as CrewDutyStatus] ?? formatStatus(value);
export const formatCrewRelease = (value: string | null) => (value ? CrewReleaseResultText[value as CrewReleaseResult] ?? formatStatus(value) : "未释放");
