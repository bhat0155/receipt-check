export const llmService = {
    async extractItems(rawText: string){
        console.log("stub llm: extracting from text")
        return [
      { name: 'Milk', price: 4.99 },
      { name: 'Bread', price: 2.49 },
      { name: 'Eggs', price: 3.99 }
    ];
    }
}