import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { approveEmailController, draftEmailController, getEmailsController, sendEmailController } from "../controllers/email.controllers.js";
import { enforcePolicy } from "../middleware/policy.middleware.js";

const router = express.Router();
router.use(isAuth);
router.post("/draft", draftEmailController);
router.get("/", getEmailsController);
router.patch("/:id/approve", enforcePolicy("email:send"), approveEmailController);
router.post("/:id/send", enforcePolicy("email:send"), sendEmailController);

export default router;
