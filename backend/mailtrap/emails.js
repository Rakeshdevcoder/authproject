import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { mailtrapclient, sender } from "./mailtrap.config.js";
import { randomBytes } from "crypto";
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapclient.send({
      from: sender,
      to: recipient,
      subject: "Verify email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verificatin",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Error sending verification email", error);
    throw new Error("Error sending verifcation email", error);
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const recipient = [{ email: userEmail }];

  try {
    const response = await mailtrapclient.send({
      from: sender,
      to: recipient,
      template_uuid: "38531e55-bfcd-49de-b6d4-696b3f1d02e3",
      template_variables: {
        company_info_name: "Auth Company",
        name: userName,
      },
    });
    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.log(`Error sending welcome email`, error);
    throw new Error(`Error senidng welcome email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (userEmail, resetURL) => {
  const recipient = [{ email: userEmail }];

  try {
    const response = await mailtrapclient.send({
      from: sender,
      to: recipient,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    console.log("Reset email sent successfully", response);
  } catch (error) {
    console.log(randomBytes);

    console.log("Error sending reset password email");
    throw new Error(error.message || "Error sending reset password email");
  }
};

export const sendResetSuccessEmail = async (userEmail) => {
  const recipient = [{ email: userEmail }];

  try {
    const response = await mailtrapclient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Succesfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log(response);
  } catch (error) {
    throw new Error(
      error.message || "Error while sending sucess password email"
    );
  }
};
