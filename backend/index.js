import express from "express";
import { connectDB } from "./db/connectDB.js";
import authRouter from "./routes/auth.routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config({ path: ".env.local" });
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;
