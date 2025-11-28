import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config()

async function runCleanup(){
    try{
        console.log("sarting cleanup job");
        // cut off time, 5 mins from now
        const FIVE_MINS_IN_MS = 5*60*1000;
        const cutOff = new Date(Date.now()-FIVE_MINS_IN_MS);
        console.log(`deleting sessions created before ${cutOff.toISOString()}`);

        const result = await prisma.receiptSession.deleteMany({
            where: {
                createdAt: {lt: cutOff}

            }
        })

        console.log(`deleted ${result.count} entries`)

    }catch(err){
        console.log(`error in cleanup: ${err}`)
    }finally{
        await prisma.$disconnect();
        process.exit(0)
    }
}

runCleanup()