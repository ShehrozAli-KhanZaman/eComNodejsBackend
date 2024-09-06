import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { placeOrder } from "../controllers/orderControllers/order.controllers.js";

const router = Router();

router.use(verifyJwt);
router.route("/place-order").post(placeOrder);

export default router;
