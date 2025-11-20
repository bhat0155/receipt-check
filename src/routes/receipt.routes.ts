import { Router } from "express";
import { receiptController } from "../controllers/receipt.controllers";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/", upload.single("file"), receiptController.create);
router.get("/:id", receiptController.getOne);
router.delete("/:id", receiptController.delete)

export default router;