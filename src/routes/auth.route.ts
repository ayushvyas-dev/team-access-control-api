import { Router } from "express";
import { register, verifyEmail } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validators/auth.validator.js";
import { verifyUserEmail } from "../services/auth.services.js";

const authRouter = Router();

authRouter.post("/register", validate(registerUserSchema), register);

// authRouter.post("/login", validate(loginUserSchema), login);

authRouter.post("/refresh", (req, res) => {
  res.send("refresh endpoint");
});

authRouter.post("/logout", (req, res) => {
  res.send("logout endpoint");
});

authRouter.post("/logout-all", (req, res) => {
  res.send("logout-all endpoint");
});

authRouter.get("/sessions", (req, res) => {
  res.send("get sessions endpoint");
});

authRouter.delete("/sessions/:sessionId", (req, res) => {
  res.send("delete session endpoint");
});

authRouter.post("/verify-email", verifyEmail);

export default authRouter;
