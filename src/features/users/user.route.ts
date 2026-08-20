import { Router } from "express";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { deleteMe, getMe, updateMe } from "./user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateUserSchema } from "./user.validation.js";

const userRouter = Router();

userRouter.get("/me", authenticate, getMe);

userRouter.patch(
  "/me",
  authenticate,
  validate({ body: updateUserSchema }),
  updateMe,
);

userRouter.delete("/me", authenticate, deleteMe);

export default userRouter;
