import { Comment } from "@prisma/client";
import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import { authUser } from "../middlewares/auth-helper";
import { getArticleList } from "../utils/article-helper";
import { okJSON } from "../utils/public";
import { UserSelect } from "../utils/selects";

interface WhereQueryType {
  cityId?: number;
  districtId?: number;
}

interface CommentWithNested extends Comment {
  nestedComments?: Comment[];
}

export const articleUrl = "/article";
export const articleRouter = Router();

articleRouter.get("/", async (req: Request, res: Response) => {
  const { cityId, districtId } = req.query;

  let whereQuery: WhereQueryType = {};

  if (Number(cityId) < 0) {
    whereQuery = {};
  } else if (Number(districtId) < 0 || districtId === undefined) {
    whereQuery.cityId = Number(cityId);
  } else {
    whereQuery = { cityId: Number(cityId), districtId: Number(districtId) };
  }

  try {
    const posts = await prisma.article.findMany({
      where: whereQuery,
      include: {
        author: {
          select: UserSelect,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!posts) {
      res.status(404).json({ error: "Posts not found" });
      return;
    }

    const postList = await getArticleList(posts);

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

    const commentsWithNested = article.comments
      .map((comment: CommentWithNested) => {
        if (comment.parentCommentId === null) {
          comment.nestedComments = article.comments.filter(
            (childComment) => childComment.parentCommentId === comment.id
          );
          return comment;
        } else {
          comment.nestedComments = [];
        }
      })
      .filter((comment) => comment !== undefined);

    res.status(201).json({
      ...article,
      cityName: city.name,
      districtName,
      comments: commentsWithNested,
      commentCount: article.comments.length,
    });
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

    const newArticleList = await getArticleList([newArticle]);

    res.status(201).json(newArticleList[0]);
  } catch (error) {
    console.error("Error while creating article:", error);
    res.status(500).json({ error: "Error while creating article" });
  }
});

articleRouter.post(
  "/like/:articleId",
  authUser,
  async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const userId = req.userId;

    try {
      await prisma.articleLike.upsert({
        where: {
          userId_articleId: {
            userId,
            articleId: Number(articleId),
          },
        },
        update: {},
        create: {
          userId,
          articleId: Number(articleId),
        },
      });

      res.status(200).json(okJSON);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Post article like Error" });
    }
  }
);

articleRouter.delete(
  "/like/:articleId",
  authUser,
  async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const userId = req.userId;

    try {
      await prisma.articleLike.delete({
        where: {
          userId_articleId: {
            userId,
            articleId: Number(articleId),
          },
        },
      });

      res.status(200).json(okJSON);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Delete article like Error" });
    }
  }
);
