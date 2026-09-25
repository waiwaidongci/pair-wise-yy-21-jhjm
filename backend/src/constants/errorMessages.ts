export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "抢修工单不存在",
  TICKET_ALREADY_RESTORED: "工单已复电，不能重复确认，也不能改回未复电",
  TICKET_NOT_RESTORED: "工单尚未复电，不能补记调整说明",
  CREW_TICKET_MISMATCH: "班组记录中挂的不是这张工单，本次确认不生效",
  SPARE_PART_REJECTED: "存在被退回的备件申请，不能确认复电",
  SPARE_PART_QTY_MISMATCH: "备件申请量与实际用量不一致，不能确认复电",
  ADJUST_NOTE_REQUIRED: "复电后补记备件必须填写调整说明",
  USAGE_NOT_FOUND: "备件申请记录不存在"
};
