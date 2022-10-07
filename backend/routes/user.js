import express from "express";
import userController from "../controllers/userController.js";
import middlewareController from "../controllers/middlewareController.js";

const router = express.Router();

//GET ALL USER
router.get("/", middlewareController.verifyToken, userController.getAllUsers);

//DELETE USER
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);

export default router;
