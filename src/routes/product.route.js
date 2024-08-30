import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  addProduct,
  deleteProduct,
} from "../controllers/productControllers/product.controllers.js";

const router = Router();

router.use(verifyJwt); //apply middleware verifyJwt to all routes in this file

router.route("/delete-product").delete(deleteProduct);
router.route("/add-product").post(verifyJwt, addProduct);

export default router;
