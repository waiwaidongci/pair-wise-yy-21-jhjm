export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: ["FaultReport.create", "FaultReport.update", "FaultReport.status", "FaultReport.export"],
  RepairTicket: ["RepairTicket.create", "RepairTicket.update", "RepairTicket.status", "RepairTicket.export", "RepairTicket.restore.confirm", "RepairTicket.restore.blocked"],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export", "Crew.release"],
  SparePartUsage: ["SparePartUsage.create", "SparePartUsage.update", "SparePartUsage.status", "SparePartUsage.export", "SparePartUsage.consume", "SparePartUsage.adjust"]
};
