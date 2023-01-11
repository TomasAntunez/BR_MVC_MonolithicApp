import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateId, generateJWT } from '../helpers/tokens.js';
import { registerEmail, forgotPasswordEmail } from '../helpers/emails.js';


const loginForm = (req, res) => {
    res.render('auth/login', {
        page: 'Log In',
        csrfToken: req.csrfToken()
    });
};


const authenticate = async (req, res) => {
    
    const { email, password } = req.body;

    await check('email').isEmail().withMessage('That doesn\'t look like an email').run(req);
    await check('password').notEmpty().withMessage('The password is required').run(req);

    let result = validationResult(req);

    // Check that the result is empty
    if( !result.isEmpty() ) {
        // There are mistakes
        return res.render('auth/login', {
            page: 'Log In',
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user: { email }
        });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if(!user) {
        return res.render('auth/login', {
            page: 'Log In',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'The user does not exists'}]
        });
    }

    // Check if the user is confirmed
    if(!user.confirmed) {
        return res.render('auth/login', {
            page: 'Log In',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'Your account has not been confirmed, you must confirm in your email'}]
        });
    }

    // Check password
    if( !user.verifyPassword(password) ) {
        return res.render('auth/login', {
            page: 'Log In',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'The password is wrong'}],
            user: { email }
        });
    }

    // Authenticate user
    const token = generateJWT(user.id);

    // Save in a cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true,
        // sameSite: true
    }).redirect('/my-properties');
}


const signOff = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login');
};


const registerForm = (req, res) => {
    res.render('auth/register', {
        page: 'Create Account',
        csrfToken: req.csrfToken()
    });
};


const register = async (req, res) => {

    const { name, email, password } = req.body;

    // Validation
    await check('name').notEmpty().withMessage('The name is required').run(req);
    await check('email').isEmail().withMessage('That doesn\'t look like an email').run(req);
    await check('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters').run(req);
    await check('repeatPassword').equals(password).withMessage('The passwords are not the same').run(req);

    let result = validationResult(req);

    // Check that the result is empty
    if( !result.isEmpty() ) {
        // There are mistakes
        return res.render('auth/register', {
            page: 'Create Account',
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user: { name, email }
        });
    }
    
    // Check that the user is not duplicated
    const userExists = await User.findOne({ where: { email } });

    if(userExists) {
        return res.render('auth/register', {
            page: 'Create Account',
            csrfToken: req.csrfToken(),
            errors: [{ msg: 'The user is already registered' }],
            user: { name, email }
        });
    }

    const user = await User.create({
        name,
        email,
        password,
        token: generateId()
    });

    // Send confirmarion email
    registerEmail({
        name: user.name,
        email: user.email,
        token: user.token
    });

    // Show confirmation message
    res.render('templates/message', {
        page: 'Account Created Succesfully',
        message: 'We sent you a confirmation message, please click on the link'
    });
};


const confirm = async (req, res) => {
    const { token } = req.params;

    // Check if token is valid
    const user = await User.findOne({ where: { token } });

    if(!user) {
        return res.render('auth/confirmAccount', {
            page: 'Error Confirming Your Account',
            message: 'There was a mistake, try again',
            error: true
        });
    }

    // Confirm account
    user.token = null;
    user.confirmed = true;
    await user.save();

    res.render('auth/confirmAccount', {
        page: 'Confirmed Account',
        message: 'The account has been confirmed correctly',
        error: false
    });
}


const forgotPasswordForm = (req, res) => {
    res.render('auth/forgotPassword', {
        page: 'Recover Your Access',
        csrfToken: req.csrfToken()
    });
};

const resetPassword = async (req, res) => {

    // Validation
    await check('email').isEmail().withMessage('That doesn\'t look like an email').run(req);

    let result = validationResult(req);

    // Check that the result is empty
    if( !result.isEmpty() ) {
        // There are mistakes
        return res.render('auth/forgotPassword', {
            page: 'Recover Your Access',
            csrfToken: req.csrfToken(),
            errors: result.array()
        });
    }

    const { email } = req.body;
    
    // Search user
    const user = await User.findOne({ where: { email } });

    if(!user) {
        return res.render('auth/forgotPassword', {
            page: 'Recover Your Access',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'The email does not belong to any user'}]
        });
    }

    // Generate token and send email
    user.token = generateId();
    await user.save();

    // Send email
    forgotPasswordEmail({
        email: user.email,
        name: user.name,
        token: user.token
    });

    // Render a message
    res.render('templates/message', {
        page: 'Reset your password',
        message: 'We have sent an email with the instructions'
    })
};


const checkToken = async (req, res) => {

    const { token } = req.params;

    const user = await User.findOne({ where: { token } });

    if(!user) {
        return res.render('auth/confirmAccount', {
            page: 'Reset Your Password',
            message: 'There was a mistake, try again',
            error: true
        });
    }

    // Show form to change the password
    res.render('auth/resetPassword', {
        page: 'Reset your password',
        csrfToken: req.csrfToken()
    });
};


const newPasword = async (req, res) => {
    // Validate password
    await check('password').isLength({ min: 6 }).withMessage('The password must be at least 6 characters').run(req);

    let result = validationResult(req);

    // Check that the result is empty
    if( !result.isEmpty() ) {
        // There are mistakes
        return res.render('auth/resetPassword', {
            page: 'Reset Your Password',
            csrfToken: req.csrfToken(),
            errors: result.array()
        });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Identify who makes the change
    const user = await User.findOne({ where: { token } });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.token = null;

    await user.save();

    res.render('auth/confirmAccount', {
        page: 'Password Reset',
        message: 'The password was saved successfully'
    });
};


export {
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
}