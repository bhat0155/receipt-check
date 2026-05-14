import { Router } from "express";
import { productCheckController } from "../controllers/productCheck.controllers";
import {upload} from "../middlewares/upload.middleware"

const productCheckRouter = Router();

productCheckRouter.post("/", upload.single("file"), productCheckController.check);

export default productCheckRouter;