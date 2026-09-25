import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";

const router = Router();
router.get("/", repairTicketController.list);
router.post("/", repairTicketController.create);
router.get("/:id/handover", repairTicketController.handover);
router.post("/:id/confirm-restoration", repairTicketController.confirmRestoration);
export default router;
