import type { Ref } from "vue";
import type { Crew } from "../types/Crew";
import type { RepairTicket } from "../types/RepairTicket";

/**
 * 班组可派状态：复电确认后班组应回到 AVAILABLE 且 current_ticket_id 清空。
 */
export function useCrewAvailability(crews: Ref<Crew[]>) {
  const crewOf = (ticket: RepairTicket | null) =>
    ticket == null ? null : crews.value.find((crew) => crew.id === ticket.team_id) ?? null;

  const isCrewMatched = (ticket: RepairTicket | null, crew: Crew | null) =>
    !!ticket && !!crew && crew.current_ticket_id === ticket.id;

  const isAvailable = (crew: Crew | null) => !!crew && crew.duty_status === "AVAILABLE" && crew.current_ticket_id == null;

  return { crewOf, isCrewMatched, isAvailable };
}
