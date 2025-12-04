import NodeCache from "node-cache";
import { transformAndFilterRecalls } from "../utils/recallFilter";


const CACHE_TTL_SECONDS = 6*60*60 // 6 hours

const recallCache = new NodeCache({stdTTL: CACHE_TTL_SECONDS});

const RECALL_CACHE_KEY = "recalls";

// Using the static JSON file URL with fresh data
const RECALLS_API_URL = 'https://recalls-rappels.canada.ca/sites/default/files/opendata-donneesouvertes/HCRSAMOpenData.json';

interface RecallItem {
    id: string,
    title: string,
    category: string,
    date: Date,
    raw: any // original data object
}

export const recallService = {
    // helper function to retrieve data from cache
    getRecallFromCache(): RecallItem[] | undefined { 
        const cachedData = recallCache.get<RecallItem[]>(RECALL_CACHE_KEY);

        if(cachedData){
            console.log("Cache hit, returning cached data") 
        }else{
            console.log("Cache miss, will fetch fresh data") 
        }

        return cachedData;
    },

    // helper to store data inside cache
    setRecallsInCache(data: RecallItem[]): void{ 
        recallCache.set(RECALL_CACHE_KEY,data);

        console.log(`Cached successfully, expires in ${CACHE_TTL_SECONDS/3600} hours.`)
    },

    async fetchAndFilterRecalls(): Promise<RecallItem[]>{ // Added Promise type hint
       // check in cache
       const cachedRecalls = this.getRecallFromCache();
       if(cachedRecalls){
        return cachedRecalls
       }

       //slow path - fetch from live api and put in cache
       const response = await fetch(RECALLS_API_URL);
       if (!response.ok) {
        throw new Error(`Failed to fetch the recalls: ${response.statusText}`);
       }
       
       const apiData: any[] = await response.json();
       
       const filteredRecalls = transformAndFilterRecalls(apiData, 5, 40);

       this.setRecallsInCache(filteredRecalls);
       return filteredRecalls;
    }

}