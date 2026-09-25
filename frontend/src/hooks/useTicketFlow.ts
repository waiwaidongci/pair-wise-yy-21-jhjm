import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useCrewStore } from "../stores/CrewStore";
import { useRestorationHandoverStore } from "../stores/RestorationHandoverStore";
import { checkTicketParts, canConfirmRestoration, type PartCheckItem } from "../utils/restorationRules";
import { createDefaultRestorationHandover } from "../constructors/RestorationHandoverConstructor";
import { syncRestorationConfirm, syncRestorationAdjust } from "../api/RestorationHandover";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RepairTicket } from "../types/RepairTicket";

export interface FlowResult {
  ok: boolean;
  code?: string;
  message?: string;
  blockers?: PartCheckItem[];
}

export function useTicketFlow() {
  const ticketStore = useRepairTicketStore();
  const partStore = useSparePartUsageStore();
  const crewStore = useCrewStore();
  const handoverStore = useRestorationHandoverStore();

  const partsOf = (ticketId: number) => partStore.rows.filter((row) => row.ticket_id === ticketId);
  const checksOf = (ticketId: number) => checkTicketParts(partsOf(ticketId));
  const hasException = (ticketId: number) => checksOf(ticketId).some((item) => !item.ok);
  const isPendingRestoration = (ticket: RepairTicket) => ticket.status !== "RESTORED" && ticket.status !== "CLOSED";
  const crewOf = (ticket: RepairTicket) => crewStore.rows.find((row) => row.id === ticket.team_id) ?? null;
  const isCrewBound = (ticket: RepairTicket) => {
    const crew = crewOf(ticket);
    return !!crew && crew.current_ticket_id === ticket.id;
  };
  const handoverOf = (ticketId: number) => handoverStore.rows.find((row) => row.ticket_id === ticketId) ?? null;

  /** 复电确认：先逐笔核对备件，再校验班组挂接，全部通过才落库并释放班组。 */
  async function confirmRestoration(ticketId: number): Promise<FlowResult> {
    const ticket = ticketStore.rows.find((row) => row.id === ticketId);
    if (!ticket) return { ok: false, code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED };
    if (!isPendingRestoration(ticket)) {
      return { ok: false, code: ERROR_CODES.TICKET_ALREADY_RESTORED, message: ERROR_MESSAGES.TICKET_ALREADY_RESTORED };
    }
    const checks = checksOf(ticketId);
    if (!canConfirmRestoration(checks)) {
      console.warn(LOG_TEMPLATES.RestorationHandover[0], ERROR_CODES.PART_CHECK_FAILED, ticketId);
      return {
        ok: false,
        code: ERROR_CODES.PART_CHECK_FAILED,
        message: ERROR_MESSAGES.PART_CHECK_FAILED,
        blockers: checks.filter((item) => !item.ok)
      };
    }
    const crew = crewOf(ticket);
    if (!crew || crew.current_ticket_id !== ticket.id) {
      console.warn(LOG_TEMPLATES.RestorationHandover[2], ERROR_CODES.CREW_TICKET_MISMATCH, ticketId);
      return { ok: false, code: ERROR_CODES.CREW_TICKET_MISMATCH, message: ERROR_MESSAGES.CREW_TICKET_MISMATCH };
    }

    const restoredAt = new Date().toISOString();
    ticketStore.markRestored(ticket.id, restoredAt);
    partStore.markConsumed(partsOf(ticket.id).map((part) => part.id));
    crewStore.applyRelease(crew.id);

    const record = createDefaultRestorationHandover({
      id: handoverStore.nextId(),
      ticket_id: ticket.id,
      restored_at: restoredAt,
      operator: "调度员",
      parts: partsOf(ticket.id).map((part) => ({
        part_code: part.part_code,
        part_name: part.part_name,
        quantity: part.quantity,
        actual_quantity: part.actual_quantity
      })),
      crew_id: crew.id,
      crew_name: crew.name,
      crew_released: true,
      released_at: restoredAt
    });
    handoverStore.append(record);
    console.info(LOG_TEMPLATES.RestorationHandover[0], record);
    console.info(LOG_TEMPLATES.RestorationHandover[2], crew.name);
    await syncRestorationConfirm(record);
    return { ok: true };
  }

  /** 复电后补记备件：只允许登记实耗并留下调整说明，工单状态保持已复电。 */
  async function adjustRestoredPart(ticketId: number, usageId: number, actualQuantity: number, note: string): Promise<FlowResult> {
    const ticket = ticketStore.rows.find((row) => row.id === ticketId);
    if (!ticket || ticket.status !== "RESTORED") {
      return { ok: false, code: ERROR_CODES.VALIDATION_FAILED, message: "仅已复电的工单支持补记调整" };
    }
    if (!note.trim()) {
      return { ok: false, code: ERROR_CODES.ADJUST_NOTE_REQUIRED, message: ERROR_MESSAGES.ADJUST_NOTE_REQUIRED };
    }
    const usage = partStore.applyAdjustment(usageId, actualQuantity, note.trim());
    if (!usage) return { ok: false, code: ERROR_CODES.VALIDATION_FAILED, message: ERROR_MESSAGES.VALIDATION_FAILED };
    console.info(LOG_TEMPLATES.RestorationHandover[3], { ticketId, usageId, actualQuantity, note });
    await syncRestorationAdjust({ ticket_id: ticketId, usage_id: usageId, actual_quantity: actualQuantity, adjust_note: note.trim() });
    return { ok: true };
  }

  return {
    partsOf,
    checksOf,
    hasException,
    isPendingRestoration,
    crewOf,
    isCrewBound,
    handoverOf,
    confirmRestoration,
    adjustRestoredPart
  };
}
