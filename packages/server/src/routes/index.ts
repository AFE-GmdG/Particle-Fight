import express from "express";

import authController from "../controllers/authController";
import stateController from "../controllers/stateController";

const router = express.Router();

router.get("/ping", stateController.serverHealthCheck);

router.get("/auth/getRandomUid", authController.getRandomUid);
router.get("/auth/login", authController.login);

export default router;
