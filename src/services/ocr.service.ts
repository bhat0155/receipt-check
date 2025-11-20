import { ImageAnnotatorClient } from "@google-cloud/vision";
const client = new ImageAnnotatorClient();

export const ocrService = {
    // here we stimulate reading a buffer and retriving text
    async extractText(imageBuffer: Buffer): Promise<string>{
       console.log("Sending the image to google vision");

       // send the image buffer to google
       const [result] = await client.documentTextDetection({
        image: {
            content: imageBuffer
        }
       })
       // extract text from result
       const fullText = result.fullTextAnnotation?.text;

       if(!fullText){
        throw new Error("no text found in this image");
       }
       console.log(`google vision found text: ${fullText}`);
       return fullText;
    }
}