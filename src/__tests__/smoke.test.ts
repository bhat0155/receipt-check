import { isWithinLastNDays } from "../utils/dateWindow";

describe("isWithinLastNDays", ()=>{
    it("Should return true for n days ago", ()=>{
        const fixedNow = new Date("2025-12-02T00:00:00Z");
        const fiveDaysAgo = new Date("2025-11-28T00:00:00Z");
        const result  = isWithinLastNDays(fiveDaysAgo, 5, fixedNow)
        expect(result).toBe(true)

    })
})