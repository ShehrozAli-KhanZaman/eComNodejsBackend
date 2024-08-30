import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  addCategory,
  getAllCategory,
  updateCategory,
} from "../controllers/categoryControllers/category.controllers.js";

const router = Router();

// verifyJwt middleware for every route
router.use(verifyJwt);

router.route("/add-category").post(addCategory);
router.route("/get-all-category").get(getAllCategory);
router.route("/update-category").patch(updateCategory);

export default router;
