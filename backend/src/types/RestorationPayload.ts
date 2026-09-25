export interface RestorationConfirmPayload {
  ticket_id?: number;
  operator?: string;
}

export interface RestorationAdjustPayload {
  ticket_id?: number;
  usage_id?: number;
  actual_quantity?: number;
  adjust_note?: string;
}
