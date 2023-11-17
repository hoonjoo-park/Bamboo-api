import { PrismaClient } from "@prisma/client";

export const bambooModel = {
  bambooPrisma: new PrismaClient(),
};
