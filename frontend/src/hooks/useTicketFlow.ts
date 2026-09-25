import { computed, reactive, ref, type Ref } from "vue";
import type { RepairTicket } from "../types/RepairTicket";
import type { SparePartUsage } from "../types/SparePartUsage";
import type { Crew } from "../types/Crew";

export type TicketListFilter = "ALL" | "PENDING_RESTORE" | "PARTS_ABNORMAL" | "RESTORED";

export const isPendingRestore = (ticket: RepairTicket) => ticket.status !== "RESTORED" && ticket.status !== "CLOSED";

export const isUsageAbnormal = (usage: SparePartUsage) =>
  usage.usage_status === "REJECTED" || (usage.actual_quantity != null && usage.actual_quantity !== usage.quantity);

export const ticketHasPartsAbnormal = (ticketId: number, usages: SparePartUsage[]) =>
  usages.some((usage) => usage.ticket_id === ticketId && isUsageAbnormal(usage));

export interface UsageCheck {
  usage: SparePartUsage;
  actual: number | null;
  problem: "REJECTED" | "QTY_MISMATCH" | "ACTUAL_MISSING" | null;
}

/**
 * 复电交接台：工单筛选、逐笔核对、确认复电的页面状态。
 * 核对规则与后端 RepairTicketService.confirmRestoration 保持一致：
 * 申请被退回或申请量与实际用量不同都不能确认。
 */
export function useTicketFlow(deps: { tickets: Ref<RepairTicket[]>; crews: Ref<Crew[]>; usages: Ref<SparePartUsage[]> }) {
  const filter = ref<TicketListFilter>("PENDING_RESTORE");
  const selectedId = ref<number | null>(null);
  const actuals = reactive<Record<number, number | null>>({});

  const usagesOf = (ticketId: number | null) =>
    ticketId == null ? [] : deps.usages.value.filter((usage) => usage.ticket_id === ticketId);

  const filteredTickets = computed(() => {
    const rows = deps.tickets.value;
    if (filter.value === "PENDING_RESTORE") return rows.filter(isPendingRestore);
    if (filter.value === "PARTS_ABNORMAL") return rows.filter((ticket) => ticketHasPartsAbnormal(ticket.id, deps.usages.value));
    if (filter.value === "RESTORED") return rows.filter((ticket) => !isPendingRestore(ticket));
    return rows;
  });

  const selected = computed(() => deps.tickets.value.find((ticket) => ticket.id === selectedId.value) ?? null);

  const select = (ticketId: number) => {
    selectedId.value = ticketId;
    for (const usage of usagesOf(ticketId)) {
      actuals[usage.id] = usage.actual_quantity;
    }
  };

  const checks = computed<UsageCheck[]>(() =>
    usagesOf(selectedId.value).map((usage) => {
      const actual = actuals[usage.id] ?? usage.actual_quantity;
      let problem: UsageCheck["problem"] = null;
      if (usage.usage_status === "REJECTED") problem = "REJECTED";
      else if (actual == null) problem = "ACTUAL_MISSING";
      else if (actual !== usage.quantity) problem = "QTY_MISMATCH";
      return { usage, actual, problem };
    })
  );

  const blockers = computed<string[]>(() => {
    const ticket = selected.value;
    if (!ticket || !isPendingRestore(ticket)) return [];
    const messages: string[] = [];
    const crew = deps.crews.value.find((row) => row.id === ticket.team_id);
    if (!crew || crew.current_ticket_id !== ticket.id) {
      messages.push(`班组「${crew?.name ?? ticket.team_id}」当前挂的不是这张工单，本次确认不会生效`);
    }
    for (const check of checks.value) {
      const label = `「${check.usage.part_name}(${check.usage.part_code})」`;
      if (check.problem === "REJECTED") messages.push(`备件申请${label}已被退回，不能确认复电`);
      if (check.problem === "ACTUAL_MISSING") messages.push(`备件${label}尚未登记实际用量`);
      if (check.problem === "QTY_MISMATCH")
        messages.push(`备件${label}申请量 ${check.usage.quantity} 与实际用量 ${check.actual ?? "—"} 不一致`);
    }
    return messages;
  });

  const canConfirm = computed(() => {
    const ticket = selected.value;
    return !!ticket && isPendingRestore(ticket) && checks.value.length > 0 && blockers.value.length === 0;
  });

  const confirmPayload = () => ({
    parts: checks.value.map((check) => ({ id: check.usage.id, actual_quantity: check.actual ?? check.usage.quantity }))
  });

  return { filter, selectedId, selected, filteredTickets, usagesOf, select, actuals, checks, blockers, canConfirm, confirmPayload };
}
