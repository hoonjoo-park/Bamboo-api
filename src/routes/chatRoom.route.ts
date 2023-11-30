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
          lastCheck: true,
        },
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
        lastCheck: user.lastCheck,
      };
    });

    return {
      ...chatRoom,
      users,
    };
  });

  res.status(200).json(chatRoomsToReturn);
});

chatRoomRouter.patch(
  "/latest-message",
  authUser,
  async (req: Request, res: Response) => {
    const { chatRoomId, latestMessageId } = req.body;

    const chatRoom = await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        latestMessageId,
      },
    });

    if (!chatRoom) {
      res.status(404).json({ error: "ChatRoom not found" });
    }

    res.status(200).json(chatRoom);
  }
);
