import type { SparePartUsage } from "../types/SparePartUsage";

export interface PartCheckItem {
  usage: SparePartUsage;
  ok: boolean;
  reasons: string[];
}

/**
 * 复电前逐笔核对备件申请：
 * - 申请被退回（REJECTED）一律阻断确认；
 * - 实耗未登记、或申请量与实际用量不一致，同样阻断确认。
 */
export function checkTicketParts(usages: SparePartUsage[]): PartCheckItem[] {
  return usages.map((usage) => {
    const reasons: string[] = [];
    if (usage.usage_status === "REJECTED") {
      reasons.push("申请已退回");
    }
    if (usage.actual_quantity === null || usage.actual_quantity === undefined) {
      reasons.push("实耗未登记");
    } else if (usage.actual_quantity !== usage.quantity) {
      reasons.push(`申请量 ${usage.quantity} 与实耗 ${usage.actual_quantity} 不一致`);
    }
    return { usage, ok: reasons.length === 0, reasons };
  });
}

export function canConfirmRestoration(items: PartCheckItem[]): boolean {
  return items.every((item) => item.ok);
}

export function hasPartException(usages: SparePartUsage[]): boolean {
  return checkTicketParts(usages).some((item) => !item.ok);
}
