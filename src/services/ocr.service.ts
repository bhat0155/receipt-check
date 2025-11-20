export const ocrService = {
    // here we stimulate reading a buffer and retriving text
    async extractText(imageBuffer: Buffer): Promise<string>{
        // in day 3, we will put google vison code here
        // for now, return the fake text
        console.log("Stub OCR, processing the image");
        return "Milk 4.99\nBread 2.49\nEggs 3.99";
    }
}