import OpenAI from "openai"
import dotenv from "dotenv";
import { response } from "express";

dotenv.config();

// setup open ai
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
})

interface RecallMatch {
    purchasedItems: string,
    recallTitle: string,
    recallId: string,
    reason: string
}

interface PurchasedItem {
    name: string,
    quantity: number
}

interface RecallItem {
    id: string,
    title: string,
    category: string,
}


export const llmService = {
    async extractItems(rawText: string){
       console.log("sending the text to openAi")
        const prompt = `
      You are an expert receipt parser. 
      Analyze the following unstructured receipt text and extract the purchased items.
      
      Rules:
      1. Return JSON ONLY.
      2. The JSON must be an object with a single key "items", which is an array of objects.
      3. Each item object must have "name" (string) and "price" (number).
      4. Ignore tax, subtotal, total, debit/credit info, store address, and headers.
      5. If the price is missing, estimate it or put 0.

      Receipt Text:
      ${rawText}
    `;

        try{
            const completion = await openai.chat.completions.create({
                messages: [
                    {role: "system", content: "You are a helpful assistant designed to output JSON"},
                    {role: "user", content: prompt}
                ],
                model: "gpt-4o-mini",
                response_format: {type: "json_object"}
            });
            const content = completion.choices[0].message.content;
            if(!content){
                throw new Error("Open AI returned empty array")
            }
            console.log("open ai response", content);

            // parse the json
            const parsed = JSON.parse(content);
            console.log({final: parsed.items})
            return parsed.items

        }catch(err){
            console.log(`LLM error: ${err}`)
            throw new Error("failed to parse receipt with openAi")
        }
    },


    // recall comparison function
    async compareWithRecall(purchasedItems: PurchasedItem[], recalledItems:RecallItem[]): Promise<RecallMatch[]>{
        console.log(`comparing ${purchasedItems.length} purchased items against ${recalledItems.length} recalled items`);
        //format text 
        const purchasedItemsList = purchasedItems.map((item)=>`-${item.name}`).join("\n")
        console.log({purchasedItemsList})
        

        // include id, title and category to give llm enough context
        const recallsList = recalledItems.map((item)=>`[ID: ${item.id}] (${item.category}) ${item.title}`).join("/n");
        console.log({recallsList})
        // ask for jsonObject with a "matches" key
        const systemPrompt = `
            You are a safety expert AI. Your task is to compare a user's grocery receipt against a list of active government recalls.

            RULES:
            1. Analyze the semantic meaning of the "Purchased Items" vs the "Active Recalls".
            2. Look for DIRECT matches (e.g., "Enoki Mushroom" matching "Enoki Mushroom Recall").
            3. Look for HIGHLY LIKELY related matches (e.g., "Bagged Salad" matching "Leafy Greens Salmonella Recall").
            4. Be conservative. Do not match unrelated items (e.g., do not match "Milk" to a "Tire" recall).
            5. You MUST return your response in valid JSON format.
            6. The JSON root must be an object containing a single key "matches", which is an array of match objects.
            
            REQUIRED OUTPUT STRUCTURE:
            {
              "matches": [
                {
                  "purchasedItemName": "String (exact name from input)",
                  "recallTitle": "String (exact title from recall list)",
                  "recallId": "String (ID from recall list)",
                  "reason": "String (Short explanation of why this matches)"
                }
              ]
            }
        `;

        // user prompt
        const userPrompt = `
            HERE ARE THE PURCHASED ITEMS:
            ${purchasedItemsList}

            HERE ARE THE ACTIVE RECALLS:
            ${recallsList}

            Find the matches now.
        `;

        try{
           const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini', 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1 
            });
             const content = response.choices[0].message.content;
             if(!content){
                throw new Error("open returned empty response");
             }

             // parse
             const parsedResult = JSON.parse(content);

             // safety check that matches exist and is an array
             if(!parsedResult.matches || !Array.isArray(parsedResult.matches)){
                console.warn("llm returned valid json but does not have matched array");
                return[];
             }

             const matches: RecallMatch[] = parsedResult.matches;
             console.log(`LLM comparison complete, it returned ${matches.length} matches`);
             return matches;
        }catch(err){
            console.log(`LLM comparison error: ${err}`);
            throw new Error(`Failed to compare purchased Items with recalled Items: ${err}`)
        }

    }
   
}