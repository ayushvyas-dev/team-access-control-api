import express from "express";

import authRouter from "./features/auth/auth.route.js";
import healthRouter from "./features/health/health.route.js";
import organizationRouter from "./features/organizations/organization.route.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import userRouter from "./features/users/user.route.js";
import membershipRouter from "./features/memberships/membership.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1", membershipRouter);

// Global error handler — must have 4 parameters to be recognised by Express
// it must be at the last just before response is sent to the client
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;
