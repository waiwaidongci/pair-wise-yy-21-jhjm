import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError } from "../utils/ServiceError";
import { createPartCheckDto, createRestorationHandoverDto, type PartCheckProblem } from "../constructors/RestorationHandoverDtoFactory";
import type { RepairTicket } from "../models/RepairTicket";
import type { SparePartUsage } from "../models/SparePartUsage";

export interface PartActualPayload {
  id: number;
  actual_quantity: number;
}

export interface ConfirmRestorationPayload {
  restored_at?: string;
  parts?: PartActualPayload[];
}

const RESTORED_STATES = ["RESTORED", "CLOSED"];

const partRef = (usage: SparePartUsage) => ({
  usage_id: usage.id,
  part_code: usage.part_code,
  part_name: usage.part_name,
  quantity: usage.quantity,
  actual_quantity: usage.actual_quantity
});

const problemOf = (usage: SparePartUsage, actual: number | null): PartCheckProblem => {
  if (usage.usage_status === "REJECTED") return "REJECTED";
  if (actual != null && actual !== usage.quantity) return "QTY_MISMATCH";
  return null;
};

const buildHandover = (ticket: RepairTicket, actuals: Map<number, number>) => {
  const crew = crewRepository.findById(ticket.team_id) ?? null;
  const usages = sparePartUsageRepository.findByTicket(ticket.id);
  const parts = usages.map((usage) =>
    createPartCheckDto(usage, problemOf(usage, actuals.get(usage.id) ?? usage.actual_quantity))
  );
  return createRestorationHandoverDto({
    ticket,
    crew,
    crew_matched: !!crew && crew.current_ticket_id === ticket.id,
    parts,
    restored: RESTORED_STATES.includes(ticket.status),
    released: ticket.crew_release_result === "RELEASED"
  });
};

const requireTicket = (ticketId: number) => {
  const ticket = repairTicketRepository.findById(ticketId);
  if (!ticket) {
    throw new ServiceError(404, ERROR_CODES.TICKET_NOT_FOUND, ERROR_MESSAGES.TICKET_NOT_FOUND);
  }
  return ticket;
};

export const repairTicketService = {
  list: () => repairTicketRepository.findAll(),
  create: (row: unknown) => repairTicketRepository.save(row as Partial<RepairTicket>),

  handover: (ticketId: number) => buildHandover(requireTicket(ticketId), new Map()),

  confirmRestoration: (ticketId: number, payload: ConfirmRestorationPayload) => {
    const ticket = requireTicket(ticketId);
    if (RESTORED_STATES.includes(ticket.status)) {
      console.info(LOG_TEMPLATES.RepairTicket[5], ticketId, ERROR_CODES.TICKET_ALREADY_RESTORED);
      throw new ServiceError(409, ERROR_CODES.TICKET_ALREADY_RESTORED, ERROR_MESSAGES.TICKET_ALREADY_RESTORED);
    }

    // 班组记录中挂的不是这张工单时，本次确认不生效。
    const crew = crewRepository.findById(ticket.team_id);
    if (!crew || crew.current_ticket_id !== ticket.id) {
      console.info(LOG_TEMPLATES.RepairTicket[5], ticketId, ERROR_CODES.CREW_TICKET_MISMATCH);
      throw new ServiceError(409, ERROR_CODES.CREW_TICKET_MISMATCH, ERROR_MESSAGES.CREW_TICKET_MISMATCH, {
        team_id: ticket.team_id,
        crew_current_ticket_id: crew?.current_ticket_id ?? null
      });
    }

    const usages = sparePartUsageRepository.findByTicket(ticket.id);
    const rejected = usages.filter((usage) => usage.usage_status === "REJECTED");
    if (rejected.length > 0) {
      console.info(LOG_TEMPLATES.RepairTicket[5], ticketId, ERROR_CODES.SPARE_PART_REJECTED);
      throw new ServiceError(409, ERROR_CODES.SPARE_PART_REJECTED, ERROR_MESSAGES.SPARE_PART_REJECTED, {
        parts: rejected.map(partRef)
      });
    }

    const submitted = new Map((payload.parts ?? []).map((part) => [part.id, part.actual_quantity]));
    const mismatched = usages.filter((usage) => {
      const actual = submitted.get(usage.id);
      return actual == null || actual !== usage.quantity;
    });
    if (mismatched.length > 0) {
      console.info(LOG_TEMPLATES.RepairTicket[5], ticketId, ERROR_CODES.SPARE_PART_QTY_MISMATCH);
      throw new ServiceError(409, ERROR_CODES.SPARE_PART_QTY_MISMATCH, ERROR_MESSAGES.SPARE_PART_QTY_MISMATCH, {
        parts: mismatched.map((usage) => ({ ...partRef(usage), actual_quantity: submitted.get(usage.id) ?? null }))
      });
    }

    // 全部核对通过：保存复电时间、备件实耗和班组释放结果。
    const restoredAt = payload.restored_at ?? new Date().toISOString();
    for (const usage of usages) {
      sparePartUsageRepository.update(usage.id, {
        actual_quantity: submitted.get(usage.id) ?? usage.quantity,
        usage_status: "CONSUMED"
      });
      console.info(LOG_TEMPLATES.SparePartUsage[4], usage.id, usage.part_code);
    }
    repairTicketRepository.update(ticket.id, {
      status: "RESTORED",
      restored_at: restoredAt,
      crew_release_result: "RELEASED"
    });
    crewRepository.update(crew.id, { current_ticket_id: null, duty_status: "AVAILABLE" });
    console.info(LOG_TEMPLATES.Crew[4], crew.id, ticket.id);
    console.info(LOG_TEMPLATES.RepairTicket[4], ticket.id, restoredAt);

    return buildHandover(requireTicket(ticketId), new Map());
  }
};
