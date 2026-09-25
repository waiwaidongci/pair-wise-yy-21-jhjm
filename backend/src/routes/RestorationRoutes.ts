import { Router } from "express";
import { restorationController } from "../controllers/RestorationController";

const router = Router();
router.get("/", restorationController.list);
router.post("/confirm", restorationController.confirm);
router.post("/adjust", restorationController.adjust);
export default router;
