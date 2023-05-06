import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";

export const articleUrl = "/article";
export const articleRouter = Router();

articleRouter.get("/", async (req: Request, res: Response) => {
  const { cityId, districtID } = req.body;

  // TODO: cityId를 기준으로 지역별 또는, 전체 게시글 반환하는 로직 구현 필요
});

articleRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { cityId, districtId, title, content } = req.body;
  const userId = req.userId;

  try {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    const district = districtId
      ? await prisma.district.findUnique({
          where: { id: districtId },
        })
      : null;

    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        cityId,
        districtId: districtId ?? null,
        author: {
          connect: { id: userId },
        },
      },
      include: {
        author: true,
        comments: true,
        likes: true,
      },
    });

    res.status(201).json({ ...newArticle, city, district });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Error creating article" });
  }
});
