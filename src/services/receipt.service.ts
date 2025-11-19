import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const receiptService = {
    // create a blank session
    async createSession(){
        return await prisma.receiptSession.create({
            data: {} // empty data for now. Date and id are auto generated
        })
    },

    // get session Id
    async getSession(id: string){
        return await prisma.receiptSession.findUnique({
            where: {id}
        })
    },

    // delete session
    async deleteSession(id: string){
        return await prisma.receiptSession.delete({
            where: {id}
        })
    }
}