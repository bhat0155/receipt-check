import { Router } from "express";
import { recallsController } from "../controllers/recalls.contollers";

export const recallRouter = Router();

recallRouter.get("/sample", recallsController.getSample)