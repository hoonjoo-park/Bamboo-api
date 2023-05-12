import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";
import { UserSelect } from "../utils/constants";

export const articleUrl = "/article";
export const articleRouter = Router();

articleRouter.get("/", async (req: Request, res: Response) => {
  const { cityId, districtID } = req.body;

  const whereQuery = districtID === -1 ? { cityId } : { cityId, districtID };

  try {
    const posts = prisma.article.findMany({
      where: whereQuery,
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fetch Posts Error" });
  }
});

articleRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { cityId, districtId, title, content } = req.body;
  const userId = req.userId;
  const isDistrictNull = districtId === -1;

  try {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    const district = isDistrictNull
      ? null
      : await prisma.district.findUnique({
          where: { id: districtId },
        });

    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        cityId,
        districtId: isDistrictNull ? null : districtId,
        author: {
          connect: { id: userId },
        },
      },
      include: {
        author: {
          select: UserSelect,
        },
        comments: true,
        likes: true,
      },
    });

    res.status(201).json({ ...newArticle, city, district });
  } catch (error) {
    console.error("Error while creating article:", error);
    res.status(500).json({ error: "Error while creating article" });
  }
});
