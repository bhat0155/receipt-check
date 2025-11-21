import { Router } from "express";
import { receiptController } from "../controllers/receipt.controllers";
import { upload } from "../middlewares/upload.middleware";

const receiptRouter = Router();

receiptRouter.post("/", upload.single("file"), receiptController.create);
receiptRouter.get("/:id", receiptController.getOne);
receiptRouter.delete("/:id", receiptController.delete)

export default receiptRouter;