import { Router } from "express";
import {
  refresh,
  register,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import { login } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerUserSchema,
  loginUserSchema,
  verifyUserSchema,
  refreshTokenSchema,
} from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validate(registerUserSchema), register);

authRouter.post("/verify-email", validate(verifyUserSchema), verifyEmail);

authRouter.post("/login", validate(loginUserSchema), login);

authRouter.post("/refresh", validate(refreshTokenSchema), refresh);

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

export default authRouter;
