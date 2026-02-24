import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import { getDocumentsController, uploadDocumentController } from "../controllers/document.controllers.js";

const router = express.Router();
router.use(isAuth);
router.post("/", upload.single("file"), uploadDocumentController);
router.get("/", getDocumentsController);

export default router;
