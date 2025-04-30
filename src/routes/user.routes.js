import {Router} from 'express';
import {resgisterUser,postUser} from "../controllers/user.controllers.js"
const router=Router();

router.get("/register",resgisterUser);
router.post("/register",postUser);
export default router;