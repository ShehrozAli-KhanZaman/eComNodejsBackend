import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  getOrder,
  placeOrder,
} from "../controllers/orderControllers/order.controllers.js";

const router = Router();

router.use(verifyJwt);
router.route("/place-order").post(placeOrder);
router.route("/get-order").get(getOrder);

export default router;
