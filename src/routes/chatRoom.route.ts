import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";

export const chatRoomUrl = "/chatRoom";
export const chatRoomRouter = Router();

chatRoomRouter.get("/", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      users: { some: { id: userId } },
    },
    include: {
      users: {
        select: {
          id: true,
          user: {
            include: {
              profile: true,
            },
          },
          userId: true,
          hasSeenLatestMessage: true,
        },
      },
      latestMessage: true,
    },
    orderBy: {
      latestMessage: {
        createdAt: "desc",
      },
    },
  });

  if (!chatRooms) {
    res.status(404).json({ error: "ChatRoom not found" });
  }

  res.status(200).json(chatRooms);
});
