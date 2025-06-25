import {Router} from 'express';
import {  
           registerUser, 
           loginUser ,
           logoutUser, 
           changePassword,
           getCurrentUser,
           changeEmail,
           adminPannel,
           searchUser
       } from "../controllers/user.controllers.js"
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
router.route("/changePassword").post(verifyJWT,changePassword)
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
router.route("/changeEmail").patch(verifyJWT,changeEmail)
router.route("/adminPannel").get(verifyJWT,adminPannel)
router.route("/searchUser").get(verifyJWT,searchUser)

export default router;