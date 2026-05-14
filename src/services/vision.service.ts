import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
})

export interface IdentifiedProduct {
    name: string;
    brand: string;
    category: string;
}

export const visionService  = {
    async identifyProduct(imageBuffer: Buffer): Promise<IdentifiedProduct>{
        const base64Image = imageBuffer.toString('base64');

        try{
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: "You are a product identification expert. Return JSON only."

                    },
                    {
                          role: "user",
                          content: [
                              {
                                  type: "image_url",
                                  image_url: { url: `data:image/jpeg;base64,${base64Image}` }
                              },
                              {
                                  type: "text",
                                  text: 'Identify this product. Return JSON: { "name": string, "brand": string, "category": string }'
                              }
                          ]
                      }
                ],
                response_format: {
                    type: 'json_object'
                },
                temperature: 0.1,
            })

            const content = response.choices[0].message.content;
            if(!content){
                throw new Error("OpenAI returned empty response");

            }
            const parsed = JSON.parse(content);
            return {
                name: String(parsed.name || ''),
                brand: String(parsed.brand || ''),
                category: String(parsed.category || ''),
            }
        }catch(err){
            console.log('Vission service error:', err);
            throw new Error('Failed to identify product from the image');
        }
    }
}