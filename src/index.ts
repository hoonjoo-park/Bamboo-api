import { PrismaClient } from "@prisma/client";
import { BambooModel } from "./index.d";

export const bambooModel: BambooModel = {
  bambooPrisma: new PrismaClient(),
};
