import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError } from "../utils/ServiceError";
import { createSparePartUsageDto } from "../constructors/SparePartUsageDtoFactory";
import type { SparePartUsage } from "../models/SparePartUsage";

export interface AdjustUsagePayload {
  adjust_note?: string;
  actual_quantity?: number;
}

const requireNote = (note: string | undefined) => {
  if (!note || !note.trim()) {
    throw new ServiceError(400, ERROR_CODES.ADJUST_NOTE_REQUIRED, ERROR_MESSAGES.ADJUST_NOTE_REQUIRED);
  }
  return note.trim();
};

export const sparePartUsageService = {
  list: () => sparePartUsageRepository.findAll(),

  create: (row: Partial<SparePartUsage>) => {
    const ticket = row.ticket_id != null ? repairTicketRepository.findById(Number(row.ticket_id)) : undefined;
    // 已复电工单上的新备件记录只能是补记：强制补记状态并要求调整说明，工单状态保持不变。
    if (ticket && (ticket.status === "RESTORED" || ticket.status === "CLOSED")) {
      const note = requireNote(row.adjust_note ?? undefined);
      const entity = sparePartUsageRepository.save(
        createSparePartUsageDto({ ...row, usage_status: "POST_RESTORE_ADJUST", adjust_note: note })
      );
      console.info(LOG_TEMPLATES.SparePartUsage[5], entity.id, ticket.id);
      return entity;
    }
    const entity = sparePartUsageRepository.save(createSparePartUsageDto(row));
    console.info(LOG_TEMPLATES.SparePartUsage[0], entity.id);
    return entity;
  },

  adjust: (usageId: number, payload: AdjustUsagePayload) => {
    const usage = sparePartUsageRepository.findById(usageId);
    if (!usage) {
      throw new ServiceError(404, ERROR_CODES.USAGE_NOT_FOUND, ERROR_MESSAGES.USAGE_NOT_FOUND);
    }
    const ticket = repairTicketRepository.findById(usage.ticket_id);
    if (!ticket) {
      throw new ServiceError(404, ERROR_CODES.TICKET_NOT_FOUND, ERROR_MESSAGES.TICKET_NOT_FOUND);
    }
    if (ticket.status !== "RESTORED") {
      throw new ServiceError(409, ERROR_CODES.TICKET_NOT_RESTORED, ERROR_MESSAGES.TICKET_NOT_RESTORED);
    }
    const note = requireNote(payload.adjust_note);
    // 复电后补记只落调整说明（可选修正实耗），工单保持已复电，绝不改回未复电。
    const updated = sparePartUsageRepository.update(usage.id, {
      adjust_note: note,
      actual_quantity: payload.actual_quantity ?? usage.actual_quantity,
      usage_status: "POST_RESTORE_ADJUST"
    });
    console.info(LOG_TEMPLATES.SparePartUsage[5], usage.id, ticket.id);
    return { usage: updated, ticket };
  }
};
