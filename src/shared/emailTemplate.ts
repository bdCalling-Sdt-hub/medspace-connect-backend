import config from '../config';
import { ICreateAccount, IResetPassword } from '../types/emailTamplate';
import dotenv from 'dotenv';
dotenv.config();
const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="${process.env.PRODUCTION_URL}/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #64bae7; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Toothlens Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #64bae7; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="${process.env.PRODUCTION_URL}/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #64bae7; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};
const aUserInterested = (
  username: string,
  providername: string,
  provideremail: string,
  spacename: string,
  spaceImage: string
) => {
  const data = {
    to: provideremail,
    subject: 'A user is interested in your space',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="${
          process.env.PRODUCTION_URL
        }/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">New Interest Alert!</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            <strong>${username}</strong> is interested in your space <strong>${spacename}</strong>
          </p>
        </div>

        <div style="margin-bottom: 30px; text-align: center;">
          <img src="${
            process.env.PRODUCTION_URL
          }${spaceImage}" alt="${spacename}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
        </div>

        <div style="background-color: #64bae7; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <p style="color: #fff; font-size: 18px; margin: 0;">
            Log in to your dashboard to respond to this inquiry
          </p>
        </div>

        <div style="text-align: center; color: #888; font-size: 14px;">
          <p>Thank you for using our platform</p>
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  aUserInterested,
};
