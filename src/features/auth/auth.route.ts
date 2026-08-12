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

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ayush
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ayush@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request
 *       409:
 *         description: User already exists
 */

authRouter.post("/register", validate({ body: registerUserSchema }), register);

authRouter.post(
  "/verify-email",
  validate({ body: verifyUserSchema }),
  verifyEmail,
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a verified user using email and password and creates a new session.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful. Access and refresh tokens are set as HTTP-only cookies.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Invalid email or password.
 *       403:
 *         description: Email is not verified.
 *       404:
 *         description: User not found.
 */

authRouter.post("/login", validate({ body: loginUserSchema }), login);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", (req, res) => {
  res.send("logout endpoint");
});

authRouter.post("/logout-all", (req, res) => {
  res.send("logout-all endpoint");
});

export default authRouter;
