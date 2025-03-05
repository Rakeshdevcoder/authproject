import { Router } from "express";
import {
  signin,
  signout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/signout", signout);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.get("/check-auth", verifyToken, checkAuth);

export default authRouter;
