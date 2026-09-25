export interface RestorationHandoverPart {
  part_code: string;
  part_name: string;
  quantity: number;
  actual_quantity: number | null;
}

export interface RestorationHandover {
  id: number;
  ticket_id: number;
  restored_at: string;
  operator: string;
  parts: RestorationHandoverPart[];
  crew_id: number;
  crew_name: string;
  crew_released: boolean;
  released_at: string;
}
