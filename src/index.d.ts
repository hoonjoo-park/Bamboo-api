import { PrismaClient } from "@prisma/client";

export * from ".prisma/client/index.d";

export interface BambooPrisma {
  bambooPrisma: PrismaClient;
}

export function getBambooPrisma(): Promise<BambooPrisma>;
