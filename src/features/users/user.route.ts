import { Router } from "express";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { deleteMe, getMe, updateMe } from "./user.controller.js";

const userRouter = Router();

userRouter.get("/me", authenticate, getMe);

userRouter.patch("/me", authenticate, updateMe);

userRouter.delete("/me", authenticate, deleteMe);

// userRouter.post("/logout", (req, res) => {
//   res.send("logout endpoint");
// });

export default userRouter;
