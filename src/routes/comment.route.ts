import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import { authUser } from "../../src/middlewares/auth-helper";
import { okJSON } from "../utils/public";

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
      query.parentCommentId = Number(parentCommentId);
    }

    try {
      await prisma.comment.create({
        data: query,
      });

      res.status(200).json(okJSON);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Post comment Error" });
    }
  }
);

commentRouter.delete(
  "/:commentId",
  authUser,
  async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.userId;

    try {
      const currentComment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
      });

      if (currentComment.authorId !== userId) {
        throw new Error("본인이 작성한 댓글만 삭제 가능합니다.");
      }

      await prisma.comment.delete({ where: { id: Number(commentId) } });

      res.status(200).json(okJSON);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
