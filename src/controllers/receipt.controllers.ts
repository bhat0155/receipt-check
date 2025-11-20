import {Request, Response} from "express";
import { receiptService } from "../services/receipt.service";
import { ocrService } from "../services/ocr.service";

export const receiptController = {
    // handle create request
    async create(req: Request, res: Response){
        try{
            if(!req.file){
                res.status(400).json({error: "no file uploaded"});
                return;
            }
            // create session
            const session = await receiptService.createSession();
            // run ocr
            try{
                const rawText  = await ocrService.extractText(req.file.buffer);
                console.log(`OCR result is ${rawText}`)
            }catch(err){
                console.log("issue running OCR", err);
                await receiptService.updateSession(session.id, {
                    ocrError: "OCR Failed (stub)",
                    purchasedItems: null
                })
                res.status(500).json("Issue running ocr");
                return;
            }
            console.log(`File recieved: ${req.file.originalname}`)
            res.status(201).json(session)
        }catch(err){
            console.log(err);
            res.status(500).json({error: "Failed to create a session"})
        }
    },

    async getOne(req: Request, res: Response){
        try{
            const {id}= req.params;
            const session = await receiptService.getSession(id);
            if(!session){
                res.status(404).json({error: "Failed to extract the session"});
                return;
            }
            res.status(200).json(session)
        }catch(err){
            console.log(err);
            res.status(500).json({error: "Failed to get the session"})
        }
    },

    async delete(req: Request, res: Response){
        try{
            const {id}=req.params;
            const session = await receiptService.deleteSession(id);
            if(!session){
                res.status(404).json({error: "Failed to find the session to delete"});
                return;
            }
            res.status(200).json("Deleted the receipt session")
        }catch(err){
            console.log(err);
            res.status(500).json({error: "Failed to delete the session"})
        }
    }
}