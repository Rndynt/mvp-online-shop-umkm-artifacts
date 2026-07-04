import { Router } from "express";
import healthRouter from "./health";
import storeRouter from "./store";
import catalogRouter from "./catalog";
import shippingRouter from "./shipping";
import checkoutRouter from "./checkout";
import ordersRouter from "./orders";
import adminProductsRouter from "./admin/products";
import adminOrdersRouter from "./admin/orders";
import adminSettingsRouter from "./admin/settings";
import storageRouter from "./storage";

const router = Router();

router.use(healthRouter);
router.use(storeRouter);
router.use(catalogRouter);
router.use(shippingRouter);
router.use(checkoutRouter);
router.use(ordersRouter);
router.use(adminProductsRouter);
router.use(adminOrdersRouter);
router.use(adminSettingsRouter);
router.use(storageRouter);

export default router;
