import { PrismaClient } from "@prisma/client";

export * from ".prisma/client/index.d";

export interface BambooModel {
  bambooPrisma: PrismaClient;
}
