import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";

export const articleUrl = "/article";
export const articleRouter = Router();

articleRouter.get("/", async (req: Request, res: Response) => {
  const { locationId } = req.body;

  // TODO: locationId를 기준으로 지역별 또는, 전체 게시글 반환하는 로직 구현 필요
});

articleRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { locationId, title, content } = req.body;
});
