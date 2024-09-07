import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
  addCategory,
  addMultipleCategories,
  deleteCategory,
  getAllCategory,
  getCategoryByIdOrName,
  updateCategory,
} from "../controllers/category.controllers.js";

const router = Router();

// verifyJwt middleware for every route
router.use(verifyJwt);

router.route("/add-category").post(addCategory);
router.route("/get-all-category").get(getAllCategory);
router.route("/update-category").patch(updateCategory);
router.route("/delete-category").delete(deleteCategory);
router.route("/add-multiple-category").post(addMultipleCategories);
router.route("/get-category-by-id-or-name").post(getCategoryByIdOrName);

export default router;
