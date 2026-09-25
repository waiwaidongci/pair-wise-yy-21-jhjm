import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";

const router = Router();
router.get("/", sparePartUsageController.list);
router.post("/", sparePartUsageController.create);
router.post("/:id/adjust", sparePartUsageController.adjust);
export default router;
