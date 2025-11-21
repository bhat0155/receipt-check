import OpenAI from "openai"
import dotenv from "dotenv";

dotenv.config();

// setup open ai
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
})


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
    }

   
}