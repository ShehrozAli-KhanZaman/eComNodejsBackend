import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { addCategory } from "../controllers/categoryControllers/category.controllers.js";

const router = Router();

// verifyJwt middleware for every route
router.use(verifyJwt);

router.route("/add-category").post(addCategory);

export default router;
