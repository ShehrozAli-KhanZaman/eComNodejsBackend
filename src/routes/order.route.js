import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  deleteOrder,
  getOrder,
  placeOrder,
  updateOrder,
} from "../controllers/orderControllers/order.controllers.js";

const router = Router();

router.use(verifyJwt);
router.route("/get-order").get(getOrder);
router.route("/place-order").post(placeOrder);
router.route("/update-order").put(updateOrder);
router.route("/delete").delete(deleteOrder);

export default router;
