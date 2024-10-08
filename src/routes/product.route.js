import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  addProduct,
  deleteProduct,
  getAllProduct,
  updateProduct,
} from "../controllers/product.controllers.js";

const router = Router();

router.use(verifyJwt); //apply middleware verifyJwt to all routes in this file

router.route("/add-product").post(addProduct);
router.route("/update-product").patch(updateProduct);
router.route("/get-all-products").post(getAllProduct);
router.route("/delete-product").delete(deleteProduct);

export default router;
