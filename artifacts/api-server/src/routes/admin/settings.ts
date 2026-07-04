import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as settingsController from "../../controllers/admin/settings.controller";

const router = Router();

router.get("/admin/settings", asyncHandler(settingsController.get));
router.put("/admin/settings", asyncHandler(settingsController.update));

export default router;
