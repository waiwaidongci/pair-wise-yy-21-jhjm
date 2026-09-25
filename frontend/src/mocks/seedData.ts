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
      "priority": "CRITICAL",
      "status": "REPAIRING",
      "assigned_at": "2026-06-11T09:00:00Z",
      "restored_at": ""
    },
    {
      "id": 2,
      "fault_report_id": 2,
      "team_id": 2,
      "dispatcher_id": 2,
      "priority": "HIGH",
      "status": "ARRIVED",
      "assigned_at": "2026-06-12T09:00:00Z",
      "restored_at": ""
    },
    {
      "id": 3,
      "fault_report_id": 3,
      "team_id": 3,
      "dispatcher_id": 3,
      "priority": "MEDIUM",
      "status": "RESTORED",
      "assigned_at": "2026-06-13T09:00:00Z",
      "restored_at": "2026-06-13T11:20:00Z"
    }
  ],
  "crew": [
    {
      "id": 1,
      "name": "抢修一班",
      "leader_id": 1,
      "skill_tags": "架空线路, 熔断器",
      "duty_status": "BUSY",
      "current_ticket_id": 1,
      "contact_phone": "13800000001"
    },
    {
      "id": 2,
      "name": "抢修二班",
      "leader_id": 2,
      "skill_tags": "台区变压器, 低压开关",
      "duty_status": "BUSY",
      "current_ticket_id": 2,
      "contact_phone": "13800000002"
    },
    {
      "id": 3,
      "name": "抢修三班",
      "leader_id": 3,
      "skill_tags": "电缆, 配电柜",
      "duty_status": "AVAILABLE",
      "current_ticket_id": 0,
      "contact_phone": "13800000003"
    }
  ],
  "sparePartUsage": [
    {
      "id": 1,
      "ticket_id": 1,
      "part_code": "DP-001",
      "part_name": "跌落式熔断器",
      "quantity": 2,
      "actual_quantity": 2,
      "warehouse_name": "中心仓库",
      "approved_by": "仓管-王五",
      "usage_status": "APPROVED",
      "adjust_note": ""
    },
    {
      "id": 2,
      "ticket_id": 1,
      "part_code": "JY-014",
      "part_name": "棒式绝缘子",
      "quantity": 5,
      "actual_quantity": 3,
      "warehouse_name": "中心仓库",
      "approved_by": "仓管-王五",
      "usage_status": "APPROVED",
      "adjust_note": ""
    },
    {
      "id": 3,
      "ticket_id": 1,
      "part_code": "DL-208",
      "part_name": "电缆终端头",
      "quantity": 1,
      "actual_quantity": null,
      "warehouse_name": "东区仓库",
      "approved_by": "仓管-赵六",
      "usage_status": "REJECTED",
      "adjust_note": ""
    },
    {
      "id": 4,
      "ticket_id": 2,
      "part_code": "BY-077",
      "part_name": "变压器油",
      "quantity": 4,
      "actual_quantity": 4,
      "warehouse_name": "中心仓库",
      "approved_by": "仓管-王五",
      "usage_status": "APPROVED",
      "adjust_note": ""
    },
    {
      "id": 5,
      "ticket_id": 2,
      "part_code": "KG-032",
      "part_name": "低压断路器",
      "quantity": 1,
      "actual_quantity": 1,
      "warehouse_name": "西区仓库",
      "approved_by": "仓管-赵六",
      "usage_status": "APPROVED",
      "adjust_note": ""
    },
    {
      "id": 6,
      "ticket_id": 3,
      "part_code": "DX-150",
      "part_name": "钢芯铝绞线",
      "quantity": 100,
      "actual_quantity": 100,
      "warehouse_name": "中心仓库",
      "approved_by": "仓管-王五",
      "usage_status": "CONSUMED",
      "adjust_note": ""
    }
  ],
  "restorationHandover": [
    {
      "id": 1,
      "ticket_id": 3,
      "restored_at": "2026-06-13T11:20:00Z",
      "operator": "调度-李四",
      "parts": [
        { "part_code": "DX-150", "part_name": "钢芯铝绞线", "quantity": 100, "actual_quantity": 100 }
      ],
      "crew_id": 3,
      "crew_name": "抢修三班",
      "crew_released": true,
      "released_at": "2026-06-13T11:20:00Z"
    }
  ]
} as const;
