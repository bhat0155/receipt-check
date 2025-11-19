import { Router } from "express";
import { receiptController } from "../controllers/receipt.controllers";

const router = Router();

router.post("/", receiptController.create);
router.get("/:id", receiptController.getOne);
router.delete("/:id", receiptController.delete)

export default router;