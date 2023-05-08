import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";

export const locationUrl = "/location";
export const locationRouter = Router();

locationRouter.get("/", async (req: Request, res: Response) => {
  const cities = await prisma.city.findMany({
    include: {
      districts: true,
    },
  });

  if (!cities) {
    res
      .status(404)
      .json({ message: "서버로부터 위치 정보를 불러올 수 없습니다." });
    return;
  }

  res.status(200).json(cities);
});
