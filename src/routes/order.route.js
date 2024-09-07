import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  getOrder,
  placeOrder,
  updateOrder,
} from "../controllers/orderControllers/order.controllers.js";

const router = Router();

router.use(verifyJwt);
router.route("/get-order").get(getOrder);
router.route("/place-order").post(placeOrder);
router.route("/update-order").put(updateOrder);

export default router;
