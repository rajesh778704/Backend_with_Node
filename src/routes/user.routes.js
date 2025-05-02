import {Router} from 'express';
import {registerUser,postUser} from "../controllers/user.controllers.js"
import { upload } from '../middlewares/multer.middleware.js';
const router=Router();

//router.post("/register",resgisterUser);
router.route("/register").post(
    upload.fields([
        {
            name:'avtar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser
)

export default router;