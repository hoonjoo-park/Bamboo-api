import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import { authUser } from "../../src/middlewares/auth-helper";

export const commentUrl = "/comment";
export const commentRouter = Router();

interface CommentQuery {
  authorId: number;
  articleId: number;
  content: string;
  parentCommentId?: number;
}

commentRouter.post(
  "/:articleId",
  authUser,
  async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.userId;

    const query: CommentQuery = {
      authorId: userId,
      articleId: Number(articleId),
      content,
    };

    if (parentCommentId !== undefined) {
      query.parentCommentId = parentCommentId;
    }

    try {
      await prisma.comment.create({
        data: query,
      });

      res.status(200).json({ message: "ok" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Post comment Error" });
    }
  }
);
