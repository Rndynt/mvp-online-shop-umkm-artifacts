import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import * as storeController from "../controllers/store.controller";

const router = Router();

router.get("/storefront", asyncHandler(storeController.getStorefront));

export default router;
