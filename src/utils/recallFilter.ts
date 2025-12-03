import { isWithinLastNDays } from "./dateWindow";

export interface RecallItem {
    id: string
    title: string
    category: string
    date: Date
    raw: any
}

export function transformAndFilterRecalls(rawRecalls: any[], daysWindow: number = 5, maxItem: number = 40, now: Date = new Date()): RecallItem[]{
    // map raw data to recallItem interface
    const mapped: RecallItem[] = rawRecalls.map((item: any)=>{
        const id = String(item.NID ?? "" );
        const title = String(item.title ?? "")
        const category = String(item.category ?? "");

        const dateStr = item["Last updated"];
        const date = dateStr ? new Date(dateStr) : new Date(0);

        return {
            id,title,category,date, raw: item
        }

    })

    // filtere by recentness
    const recent = mapped.filter((item)=>isWithinLastNDays(item.date, daysWindow, now));

    // sort newest to oldest
    recent.sort((a,b)=> b.date.getTime()-a.date.getTime());

    // cap to maxItems
   return recent.slice(0, maxItem)
}