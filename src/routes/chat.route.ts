import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";

export const chatUrl = "/chat";
export const chatRouter = Router();

chatRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { chatRoomId, message } = req.body;
  const userId = req.userId;

  const chatRoom = await prisma.chatRoom.findUnique({
    where: {
      id: chatRoomId,
    },
  });

  if (!chatRoom) {
    res.status(404).json({ error: "ChatRoom not found" });
  }

  const chat = await prisma.message.create({
    data: {
      senderId: userId,
      sender: {
        connect: {
          id: userId,
        },
      },
      chatRoomId,
      chatRoom: {
        connect: {
          id: chatRoomId,
        },
      },
      content: message,
    },
    include: {
      sender: {
        select: {
          profile: true,
        },
      },
    },
  });

  res.status(200).json(chat);
});
