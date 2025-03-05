import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User email already exists",
      });
    }
    //Hashing password
    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      name,
      email,
      password: hashed,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
    });

    await user.save();

    //jwt
    generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "User created Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "SignUp Error",
    });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); //comparing entered password and database saved password

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastSignIn = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const signout = async (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({
    success: true,
    message: "Signout Successful",
  });
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Verification code is required",
    });
  }

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found email does not exists",
      });
    }

    //Generate reset token
    const resetToken = randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    //send a email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    //Update password
    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfull",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error while sending reset password email",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
  } catch (error) {}
};
