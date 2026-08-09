import { Router } from "express";

import {
  deleteAllSession,
  deleteSession,
  getAllSession,
} from "./session.controller.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { deleteSessionSchema } from "./session.validation.js";

const sessionRouter = Router();

sessionRouter.get("/", authenticate, getAllSession);

sessionRouter.delete(
  "/:sessionId",
  authenticate,
  validate({ params: deleteSessionSchema }),
  deleteSession,
);

sessionRouter.delete("/", authenticate, deleteAllSession);

export default sessionRouter;
