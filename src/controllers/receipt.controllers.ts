import {Request, Response} from "express";
import { receiptService } from "../services/receipt.service";

export const receiptController = {
    // handle create request
    async create(req: Request, res: Response){
        try{
            const session = await receiptService.createSession();
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