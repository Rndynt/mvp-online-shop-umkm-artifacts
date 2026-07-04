import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storeRouter from "./store";
import catalogRouter from "./catalog";
import shippingRouter from "./shipping";
import checkoutRouter from "./checkout";
import ordersRouter from "./orders";
import adminProductsRouter from "./admin-products";
import adminOrdersRouter from "./admin-orders";
import adminSettingsRouter from "./admin-settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storeRouter);
router.use(catalogRouter);
router.use(shippingRouter);
router.use(checkoutRouter);
router.use(ordersRouter);
router.use(adminProductsRouter);
router.use(adminOrdersRouter);
router.use(adminSettingsRouter);

export default router;
