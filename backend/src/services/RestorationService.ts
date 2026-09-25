import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { restorationRepository } from "../repositories/RestorationRepository";
import { createRestorationDto } from "../constructors/RestorationDtoFactory";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RestorationAdjustPayload, RestorationConfirmPayload } from "../types/RestorationPayload";

type ErrorCode = keyof typeof ERROR_CODES;

class RestorationError extends Error {
  constructor(public status: number, public code: ErrorCode, public blockers?: unknown) {
    super(ERROR_MESSAGES[code]);
  }
}

export const restorationService = {
  list: () => restorationRepository.findAll(),

  /** 复电确认：逐笔核对备件 → 校验班组挂接 → 落库复电时间/实耗 → 释放班组。 */
  confirm(payload: RestorationConfirmPayload) {
    const ticketId = Number(payload?.ticket_id);
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new RestorationError(404, "VALIDATION_FAILED");
    if (ticket.status === "RESTORED" || ticket.status === "CLOSED") {
      throw new RestorationError(409, "TICKET_ALREADY_RESTORED");
    }

    const parts = sparePartUsageRepository.findByTicket(ticket.id);
    const blockers = parts.filter(
      (part) => part.usage_status === "REJECTED" || part.actual_quantity === null || part.actual_quantity !== part.quantity
    );
    if (blockers.length > 0) {
      console.warn(LOG_TEMPLATES.RestorationHandover[0], ERROR_CODES.PART_CHECK_FAILED, ticket.id);
      throw new RestorationError(409, "PART_CHECK_FAILED", blockers.map((part) => part.part_code));
    }

    const crew = crewRepository.findById(ticket.team_id);
    if (!crew || crew.current_ticket_id !== ticket.id) {
      console.warn(LOG_TEMPLATES.RestorationHandover[2], ERROR_CODES.CREW_TICKET_MISMATCH, ticket.id);
      throw new RestorationError(409, "CREW_TICKET_MISMATCH");
    }

    const restoredAt = new Date().toISOString();
    repairTicketRepository.save({ ...ticket, status: "RESTORED", restored_at: restoredAt });
    parts.forEach((part) => sparePartUsageRepository.save({ ...part, usage_status: "CONSUMED" }));
    crewRepository.save({ ...crew, current_ticket_id: 0, duty_status: "AVAILABLE" });

    const record = restorationRepository.save(
      createRestorationDto({
        id: restorationRepository.nextId(),
        ticket_id: ticket.id,
        restored_at: restoredAt,
        operator: payload.operator ?? "dispatcher",
        parts: parts.map((part) => ({
          part_code: part.part_code,
          part_name: part.part_name,
          quantity: part.quantity,
          actual_quantity: part.actual_quantity
        })),
        crew_id: crew.id,
        crew_name: crew.name,
        crew_released: true,
        released_at: restoredAt
      })
    );
    console.log(LOG_TEMPLATES.RestorationHandover[0], record.id);
    console.log(LOG_TEMPLATES.RestorationHandover[2], crew.name);
    return record;
  },

  /** 复电后补记：只允许登记实耗并留下调整说明，工单状态保持已复电。 */
  adjust(payload: RestorationAdjustPayload) {
    const ticketId = Number(payload?.ticket_id);
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket || ticket.status !== "RESTORED") throw new RestorationError(409, "VALIDATION_FAILED");
    const note = String(payload?.adjust_note ?? "").trim();
    if (!note) throw new RestorationError(400, "ADJUST_NOTE_REQUIRED");
    const usage = sparePartUsageRepository.findById(Number(payload?.usage_id));
    if (!usage || usage.ticket_id !== ticket.id) throw new RestorationError(404, "VALIDATION_FAILED");
    const saved = sparePartUsageRepository.save({
      ...usage,
      actual_quantity: Number(payload?.actual_quantity),
      adjust_note: note
    });
    console.log(LOG_TEMPLATES.RestorationHandover[3], saved.id);
    return saved;
  }
};
