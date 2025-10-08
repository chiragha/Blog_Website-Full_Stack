import express, { Router } from "express";
import { login, logout, register } from "../controller/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);


export default router;