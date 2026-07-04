import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import * as catalogController from "../controllers/catalog.controller";

const router = Router();

router.get("/products", asyncHandler(catalogController.list));
router.get("/products/:slug", asyncHandler(catalogController.getBySlug));

export default router;
