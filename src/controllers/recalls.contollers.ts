import { Request, Response } from "express";
import { recallService } from "../services/recalls.service";

export const recallsController = {
    async getSample(req: Request, res: Response){
        try{
            const recalls = await recallService.fetchAndFilterRecalls();
            res.status(200).json(recalls)
        }catch(err){
            console.log("Error fetching recalls");
            res.status(500).json({error: "Error fetching recalls"})
        }
    }
}