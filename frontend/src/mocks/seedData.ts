export const mockData = {
  "gridAsset": [
    {
      "id": 1,
      "asset_code": "asset code 1",
      "asset_type": "VOLTAGE_LOW",
      "feeder_line": "feeder line 1",
      "voltage_level": "LOW",
      "location_desc": "location desc 1",
      "health_status": "ASSIGNED",
      "owner_team_id": 1
    },
    {
      "id": 2,
      "asset_code": "asset code 2",
      "asset_type": "TRIP",
      "feeder_line": "feeder line 2",
      "voltage_level": "MEDIUM",
      "location_desc": "location desc 2",
      "health_status": "ARRIVED",
      "owner_team_id": 2
    },
    {
      "id": 3,
      "asset_code": "asset code 3",
      "asset_type": "EQUIPMENT_DAMAGE",
      "feeder_line": "feeder line 3",
      "voltage_level": "HIGH",
      "location_desc": "location desc 3",
      "health_status": "WAIT_DISPATCH",
      "owner_team_id": 3
    }
  ],
  "faultReport": [
    {
      "id": 1,
      "reporter_name": "reporter name 1",
      "phone": "13800000001",
      "asset_id": 1,
      "fault_type": "VOLTAGE_LOW",
      "address_desc": "address desc 1",
      "severity": "severity 1",
      "report_channel": "report channel 1",
      "status": "ASSIGNED"
    },
    {
      "id": 2,
      "reporter_name": "reporter name 2",
      "phone": "13800000002",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "address desc 2",
      "severity": "severity 2",
      "report_channel": "report channel 2",
      "status": "ARRIVED"
    },
    {
      "id": 3,
      "reporter_name": "reporter name 3",
      "phone": "13800000003",
      "asset_id": 3,
      "fault_type": "EQUIPMENT_DAMAGE",
      "address_desc": "address desc 3",
      "severity": "severity 3",
      "report_channel": "report channel 3",
      "status": "WAIT_DISPATCH"
    }
  ],
  "repairTicket": [
    {
      "id": 1,
      "fault_report_id": 1,
      "team_id": 1,
      "dispatcher_id": 1,
      "priority": "HIGH",
      "status": "REPAIRING",
      "assigned_at": "2026-09-25T08:10:00Z",
      "restored_at": null,
      "crew_release_result": null
    },
    {
      "id": 2,
      "fault_report_id": 2,
      "team_id": 2,
      "dispatcher_id": 1,
      "priority": "MEDIUM",
      "status": "ARRIVED",
      "assigned_at": "2026-09-25T09:20:00Z",
      "restored_at": null,
      "crew_release_result": null
    },
    {
      "id": 3,
      "fault_report_id": 3,
      "team_id": 3,
      "dispatcher_id": 2,
      "priority": "LOW",
      "status": "ASSIGNED",
      "assigned_at": "2026-09-25T10:05:00Z",
      "restored_at": null,
      "crew_release_result": null
    },
    {
      "id": 4,
      "fault_report_id": 1,
      "team_id": 1,
      "dispatcher_id": 1,
      "priority": "HIGH",
      "status": "RESTORED",
      "assigned_at": "2026-09-24T07:40:00Z",
      "restored_at": "2026-09-24T11:42:00Z",
      "crew_release_result": "RELEASED"
    }
  ],
  "crew": [
    {
      "id": 1,
      "name": "城东抢修一班",
      "leader_id": 11,
      "skill_tags": "10kV 架线,熔断器更换",
      "duty_status": "BUSY",
      "current_ticket_id": 1,
      "contact_phone": "13800000001"
    },
    {
      "id": 2,
      "name": "城西抢修二班",
      "leader_id": 12,
      "skill_tags": "电缆接头,耐压试验",
      "duty_status": "BUSY",
      "current_ticket_id": 2,
      "contact_phone": "13800000002"
    },
    {
      "id": 3,
      "name": "园区抢修三班",
      "leader_id": 13,
      "skill_tags": "台区变压器,低压出线",
      "duty_status": "AVAILABLE",
      "current_ticket_id": null,
      "contact_phone": "13800000003"
    }
  ],
  "sparePartUsage": [
    {
      "id": 1,
      "ticket_id": 1,
      "part_code": "FUSE-10K-50A",
      "part_name": "10kV 跌落式熔断器",
      "quantity": 2,
      "warehouse_name": "城东中心库",
      "approved_by": "仓管-王五",
      "usage_status": "APPROVED",
      "actual_quantity": null,
      "adjust_note": null
    },
    {
      "id": 2,
      "ticket_id": 1,
      "part_code": "INS-10K-P15",
      "part_name": "针式绝缘子",
      "quantity": 6,
      "warehouse_name": "城东中心库",
      "approved_by": "仓管-王五",
      "usage_status": "APPROVED",
      "actual_quantity": null,
      "adjust_note": null
    },
    {
      "id": 3,
      "ticket_id": 2,
      "part_code": "CAB-JNT-1K",
      "part_name": "1kV 电缆中间接头",
      "quantity": 4,
      "warehouse_name": "城西中心库",
      "approved_by": "仓管-赵六",
      "usage_status": "REJECTED",
      "actual_quantity": null,
      "adjust_note": null
    },
    {
      "id": 4,
      "ticket_id": 2,
      "part_code": "ARR-10K-YH5W",
      "part_name": "10kV 避雷器",
      "quantity": 1,
      "warehouse_name": "城西中心库",
      "approved_by": "仓管-赵六",
      "usage_status": "APPROVED",
      "actual_quantity": null,
      "adjust_note": null
    },
    {
      "id": 5,
      "ticket_id": 4,
      "part_code": "FUSE-10K-50A",
      "part_name": "10kV 跌落式熔断器",
      "quantity": 3,
      "warehouse_name": "城东中心库",
      "approved_by": "仓管-王五",
      "usage_status": "CONSUMED",
      "actual_quantity": 3,
      "adjust_note": null
    },
    {
      "id": 6,
      "ticket_id": 4,
      "part_code": "CLAMP-JDL-16",
      "part_name": "并沟线夹",
      "quantity": 8,
      "warehouse_name": "城东中心库",
      "approved_by": "仓管-王五",
      "usage_status": "CONSUMED",
      "actual_quantity": 8,
      "adjust_note": null
    },
    {
      "id": 7,
      "ticket_id": 4,
      "part_code": "CLAMP-JDL-16",
      "part_name": "并沟线夹",
      "quantity": 1,
      "warehouse_name": "城东中心库",
      "approved_by": "仓管-王五",
      "usage_status": "POST_RESTORE_ADJUST",
      "actual_quantity": 1,
      "adjust_note": "复电后补记：收尾时发现多消耗 1 只，按实耗登记"
    }
  ]
} as const;
