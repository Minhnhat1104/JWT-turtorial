import authController from "../controllers/authController.js";
import middlewareController from "../controllers/middlewareController.js";
import express from "express";

const router = express.Router();

//Register
router.post("/register", authController.registerUser);
//Log-in
router.post("/log", authController.loginUser);
//Refresh token
router.post("/refresh", authController.requestRefreshToken);
//Log-out
router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logoutUser
);

export default router;
