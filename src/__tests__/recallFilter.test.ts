import { transformAndFilterRecalls, RecallItem } from "../utils/recallFilter";

describe("transform and filter recalls", ()=>{
    const fixedNow = new Date("2025-11-30T00:00:00Z");

    const rawRecallsSample = [
    {
      NID: "100",
      Title: "Recent food recall",
      Category: "Food",
      "Last updated": "2025-11-29", // 1 day ago
    },
    {
      NID: "101",
      Title: "Borderline 5-day recall",
      Category: "Consumer product",
      "Last updated": "2025-11-25", // exactly 5 days ago
    },
    {
      NID: "102",
      Title: "Too old recall",
      Category: "Toy",
      "Last updated": "2025-11-24", // 6 days ago -> should be filtered out
    },
    {
      NID: "103",
      Title: "Most recent recall",
      Category: "Food",
      "Last updated": "2025-11-30", // same day as now
    },
  ];

  it("only keeps recalls within last N days", ()=>{
    const result = transformAndFilterRecalls(rawRecallsSample, 5,40, fixedNow);

    const ids = result.map((item)=>item.id);
        expect(ids).toContain("100")
        expect(ids).toContain("101")
         expect(ids).toContain("103")
        expect(ids).not.toContain("102")


  }),

  it("sorts with newest dates", ()=>{
        const result = transformAndFilterRecalls(rawRecallsSample, 5,40, fixedNow);

        expect(result.length).toBe(3)
        expect(result[0].id).toBe("103")
        expect(result[1].id).toBe("100")


  })  ,

  it("respects the max limit", ()=>{
    const manyRaw = [];
    for(let i = 0; i<50; i++){
      manyRaw.push({
        NID: String(200+i),
        title: `Recall ${i}`,
        category: `Recall ${i}`,
      "Last updated": "2025-11-30",
      })


    }
    const result = transformAndFilterRecalls(manyRaw, 5, 30, fixedNow);
      expect(result.length).toBe(30)
  })
})