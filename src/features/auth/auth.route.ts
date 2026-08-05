import { Router } from "express";
import { refresh, register, verifyEmail } from "./auth.controller.js";
import { login } from "./auth.controller.js";
import {
  registerUserSchema,
  loginUserSchema,
  verifyUserSchema,
} from "./auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";

const authRouter = Router();

authRouter.post("/register", validate({ body: registerUserSchema }), register);

authRouter.post(
  "/verify-email",
  validate({ body: verifyUserSchema }),
  verifyEmail,
);

authRouter.post("/login", validate({ body: loginUserSchema }), login);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", (req, res) => {
  res.send("logout endpoint");
});

authRouter.post("/logout-all", (req, res) => {
  res.send("logout-all endpoint");
});

export default authRouter;
