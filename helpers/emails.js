import nodemailer from 'nodemailer';


const registerEmail = async (data) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { name, email, token } = data;

    // Send email
    await transport.sendMail({
        from: 'RealEstate.com',
        to: email,
        subject: 'Confirm your account in RealEstate.com',
        text: 'Confirm your account in RealEstate.com',
        html: `
            <p>Hello ${name}, check your account in realestate.com</p>

            <p>
                Your account is ready, you just have to confirm in the following link: 
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirm/${token}">Confirm Account</a>
            </p>

            <p>If you did not create this account, ignore the message.</p>
        `
    });
}

const forgotPasswordEmail = async (data) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { name, email, token } = data;

    // Send email
    await transport.sendMail({
        from: 'RealEstate.com',
        to: email,
        subject: 'Reset your password in RealEstate.com',
        text: 'Reset your password in RealEstate.com',
        html: `
            <p>Hello ${name}, you have requested to reset your password in realestate.com</p>

            <p>
                Follow the link below to generate a new password: 
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/forgot-password/${token}">Change password</a>
            </p>

            <p>If you did not request the password change, ignore the message.</p>
        `
    });
}

export {
    registerEmail,
    forgotPasswordEmail
}