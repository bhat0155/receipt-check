import { Request, Response } from "express";
import { visionService } from "../services/vision.service";
import { recallService } from "../services/recalls.service";
import { llmService } from "../services/llm.service";

export const productCheckController = {
    async check(req: Request, res: Response) {
        if(!req.file){
            res.status(400).json({error: "No file uploaded"});
            return;
        }

        // step 1: Identify the product
        let product;
        try{
            product = await visionService.identifyProduct(req.file.buffer)
        }catch(err){
            console.log('Error identifying product:', err);
            res.status(500).json({error: "Error identifying product"});
            return;
        }

        if(!product.name){
            res.status(400).json({error: "Could not identify product"});
            return;
        }

        // step 2: Check for recalls
        let recalls;
        try{
            recalls = await recallService.fetchAndFilterRecalls();
        }catch(err){
            console.log('Error checking recalls:', err);
            res.status(500).json({error: "Failed to fetch recall information"});
            return; 
        }

        // step 3: Compare identified product with recalls using LLM
        let matches;
        try{
            const itemName = `${product.brand} ${product.name}`.trim();
            matches = await llmService.compareWithRecall([{name: itemName, quantity: 1}], recalls);
        }catch(err){
            console.log('Error comparing product with recalls:', err);
            res.status(500).json({error: "Failed to compare product with recalls"});
            return; 
        }

        const verdict = matches.length === 0 ? "safe" : "unsafe";
        res.status(200).json({
            product, verdict, matches
        })
    }
}