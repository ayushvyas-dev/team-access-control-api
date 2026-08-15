import express from "express";

import authRouter from "./features/auth/auth.route.js";
import healthRouter from "./features/health/health.route.js";
import organizationRouter from "./features/organizations/organization.route.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import userRouter from "./features/users/user.route.js";
import membershipRouter from "./features/memberships/membership.route.js";
import invitationRouter from "./features/invitations/invitation.route.js";
import sessionRouter from "./features/sessions/session.route.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";

import loggerMiddleware from "./middlewares/logger.middleware.js";
import cors from "cors";
import { config } from "./config/env.config.js";

import {
  genericLimiter,
  authLimiter,
  organizationLimiter,
  rateLimit,
} from "./middlewares/rate-limit/index.js";

const app = express();

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
// Add the logger middleware to log incoming requests
app.use(loggerMiddleware);

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", rateLimit(authLimiter), authRouter);
app.use(
  "/api/v1/organizations",
  rateLimit(organizationLimiter),
  organizationRouter,
);
app.use("/api/v1/users", userRouter);
app.use("/api/v1", membershipRouter);
app.use("/api/v1", invitationRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler — must have 4 parameters to be recognised by Express
// it must be at the last just before response is sent to the client
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;
