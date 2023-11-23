import { PrismaClient } from "@prisma/client";
import { BambooPrisma } from "./index.d";

const bambooPrisma = new PrismaClient();

export const getBambooPrisma = async (props: any): Promise<BambooPrisma> => {
  return { ...props, bambooPrisma };
};
