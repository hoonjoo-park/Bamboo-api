import { PrismaClient } from "@prisma/client";
import { Context } from "./index.d";

const bambooPrisma = new PrismaClient();

export const createContext = async (ctx: any): Promise<Context> => {
  ctx.callbackWaitsForEmptyEventLoop = false;

  return { ...ctx, bambooPrisma };
};
