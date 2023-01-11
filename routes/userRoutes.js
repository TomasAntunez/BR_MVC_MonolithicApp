import express from "express";
import {
    loginForm,
    authenticate,
    registerForm,
    register,
    confirm,
    forgotPasswordForm,
    resetPassword,
    checkToken,
    newPasword,
    signOff
} from "../controllers/userController.js";


const router = express.Router();


router.get('/login', loginForm);
router.post('/login', authenticate);

router.post('/signoff', signOff);

router.get('/register', registerForm);
router.post('/register', register);

router.get('/confirm/:token', confirm);

router.get('/forgot-password', forgotPasswordForm);
router.post('/forgot-password', resetPassword);
router.get('/forgot-password/:token', checkToken);
router.post('/forgot-password/:token', newPasword);


export default router;