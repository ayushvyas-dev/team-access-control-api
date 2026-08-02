import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/me", authenticate, getMe);

userRouter.patch("/me", authenticate, (req, res) => {
  res.send("update me endpoint");
});

userRouter.delete("/me", authenticate, (req, res) => {
  res.send("delete me endpoint");
});

// userRouter.post("/logout", (req, res) => {
//   res.send("logout endpoint");
// });

export default userRouter;
