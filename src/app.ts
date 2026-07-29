import express from "express";

import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/health.route.js";
import organizationRouter from "./routes/organization.route.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);

// Global error handler — must have 4 parameters to be recognised by Express
// it must be at the last just before response is sent to the client
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;
