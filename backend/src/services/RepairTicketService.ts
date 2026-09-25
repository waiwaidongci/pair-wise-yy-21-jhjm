import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketService = {
  list: () => repairTicketRepository.findAll(),
  create: (row: unknown) => repairTicketRepository.save(row as RepairTicket)
};
