import { computed } from "vue";
import { useCrewStore } from "../stores/CrewStore";
import type { Crew } from "../types/Crew";

export function useCrewAvailability() {
  const crewStore = useCrewStore();
  const availableCrews = computed(() => crewStore.rows.filter((crew) => crew.duty_status === "AVAILABLE"));
  const busyCrews = computed(() => crewStore.rows.filter((crew) => crew.duty_status !== "AVAILABLE"));
  const isAvailable = (crew: Crew | null | undefined) => !!crew && crew.duty_status === "AVAILABLE" && crew.current_ticket_id === 0;
  const isBoundTo = (crew: Crew | null | undefined, ticketId: number) => !!crew && crew.current_ticket_id === ticketId;
  return { availableCrews, busyCrews, isAvailable, isBoundTo };
}
