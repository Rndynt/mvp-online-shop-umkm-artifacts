import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import * as productsController from "../../controllers/admin/products.controller";

const router = Router();

router.get("/admin/products", asyncHandler(productsController.list));
router.get("/admin/products/:id", asyncHandler(productsController.get));
router.post("/admin/products", asyncHandler(productsController.create));
router.put("/admin/products/:id", asyncHandler(productsController.update));
router.delete("/admin/products/:id", asyncHandler(productsController.remove));

export default router;
