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
          user: {
            select: {
              profile: true,
            },
          },
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

  const chatRoomsToReturn = chatRooms.map((chatRoom) => {
    const users = chatRoom.users.map((user) => {
      return {
        profile: user.user.profile,
        hasSeenLatestMessage: user.hasSeenLatestMessage,
      };
    });

    return {
      ...chatRoom,
      users,
    };
  });

  res.status(200).json(chatRoomsToReturn);
});
