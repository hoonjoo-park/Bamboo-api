import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";

export const userUrl = "/chatRoom";
export const chatRoomRouter = Router();

chatRoomRouter.get("/", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  const chatRooms = await prisma.chatRoom.findMany({
    where: { users: { some: { id: userId } } },
    select: { id: true, users: true, lastMessageId: true, unReadCount: true },
  });

  if (!chatRooms) {
    res.status(404).json({ error: "ChatRoom not found" });
    return;
  }

  res.json(chatRooms);
});
