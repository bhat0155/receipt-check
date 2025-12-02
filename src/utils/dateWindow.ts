export function isWithinLastNDays(target: Date, nDays: number, now: Date = new Date()): boolean{
        if(nDays<0){
            return false;
        }

        const millisPerDay = 24 *60*60*1000;
        const cutOff = new Date(now.getTime()-nDays*millisPerDay);

        // only count days which are between cutoff date and now
        return target >=cutOff && target<=now;
}