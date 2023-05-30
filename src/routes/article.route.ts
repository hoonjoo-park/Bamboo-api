import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";
import { UserSelect } from "../utils/constants";

interface WhereQueryType {
  [key: string]: string;
  cityId?: any;
  districtId?: any;
}

export const articleUrl = "/article";
export const articleRouter = Router();

articleRouter.get("/", async (req: Request, res: Response) => {
  const { cityId, districtId } = req.body;

  let whereQuery: WhereQueryType = {};

  if (cityId < 0) {
    whereQuery = {};
  } else if (districtId < 0) {
    whereQuery.cityId = cityId;
  } else {
    whereQuery = { cityId, districtId };
  }

  try {
    const posts = await prisma.article.findMany({
      where: whereQuery,
      include: {
        author: {
          select: UserSelect,
        },
      },
    });

    const postList = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await prisma.comment.count({
          where: { articleId: post.id },
        });

        const likeCount = await prisma.articleLike.count({
          where: { articleId: post.id },
        });

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.author,
          cityId: post.cityId,
          districtId: post.districtId,
          commentCount: commentCount,
          likeCount: likeCount,
          createdAt: post.createdAt,
        };
      })
    );

    res.status(200).json(postList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fetch Posts Error" });
  }
});

articleRouter.get("/:articleId", async (req: Request, res: Response) => {
  const { articleId } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id: Number(articleId) },
      include: {
        author: {
          select: UserSelect,
        },
        comments: {
          include: {
            author: {
              select: UserSelect,
            },
          },
        },
        likes: true,
      },
    });

    const city = await prisma.city.findUnique({
      where: { id: article.cityId },
    });

    let districtName = null;

    if (article.districtId !== null) {
      const district = await prisma.district.findUnique({
        where: { id: article.districtId },
      });

      districtName = district.name;
    }

    res.status(201).json({ ...article, cityName: city.name, districtName });
  } catch (error) {
    console.error("Error while fetching article:", error);
    res.status(500).json({ error: "Error while fetching article" });
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
