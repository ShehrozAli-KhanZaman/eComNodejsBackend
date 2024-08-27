import { Router } from 'express';
import { registerUser } from '../../controllers/userControllers/user.controllers.js';

const router = Router();

router.route('/register').post(registerUser);

export default router;
