import {Request, Response} from "express";
import { receiptService } from "../services/receipt.service";
import { ocrService } from "../services/ocr.service";
import { llmService } from "../services/llm.service";

export const receiptController = {
    // handle create request
    async create(req: Request, res: Response){
        try{
            // 0 validation
            if(!req.file){
                res.status(400).json({error: "no file uploaded"});
                return;
            }
            // 1 create session
            const session = await receiptService.createSession();
            let rawText="";
            // run ocr CheckPoint 1
            try{
                rawText  = await ocrService.extractText(req.file.buffer);
            }catch(err){
                console.log("issue running OCR", err);
                await receiptService.updateSession(session.id, {
                    ocrError: "OCR Failed (stub)",
                })
                res.status(500).json("Issue running ocr");
                return;
            }

            // run LLM checkpoint 2
            let items = []
            try{
                items = await llmService.extractItems(rawText)
            }catch(err){
                console.log("issue running llm")
                await receiptService.updateSession(session.id, {
                    llmError: "Issue with LLMs (stub)"
                })
                res.status(500).json("issue running llm");
                return;
            }
            // if both steps works, update session
            const updatedSession = await receiptService.updateSession(session.id,{
                purchasedItems: items,
                llmError: null,
                ocrError: null
            })
            res.status(201).json(updatedSession)
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