export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PART_CHECK_FAILED: "备件核对未通过：存在被退回或申请量与实耗不一致的申请",
  CREW_TICKET_MISMATCH: "班组当前挂接的不是这张工单，本次确认不生效",
  TICKET_ALREADY_RESTORED: "工单已复电，不能改回未复电状态",
  ADJUST_NOTE_REQUIRED: "复电后补记备件必须填写调整说明"
};
