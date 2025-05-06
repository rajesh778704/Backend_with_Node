import {Router} from 'express';
import {registerUser, loginUser , logoutUser} from "../controllers/user.controllers.js"
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";
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

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser)

export default router;