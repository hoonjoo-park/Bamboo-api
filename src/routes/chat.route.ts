import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import { authUser } from "../middlewares/auth-helper";

export const chatUrl = "/chat";
export const chatRouter = Router();

chatRouter.get(
  "/:chatRoomId",
  authUser,
  async (req: Request, res: Response) => {
    const { page } = req.query;
    const { chatRoomId } = req.params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: Number(chatRoomId),
      },
    });

    if (!chatRoom) {
      res.status(404).json({ error: "ChatRoom not found" });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatRoomId: Number(chatRoomId),
      },
      include: {
        sender: {
          select: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Number(page),
    });

    res.status(200).json(messages.reverse());
  }
);

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

  const chatMessage = await prisma.message.create({
    data: {
      senderId: userId,
      chatRoomId,
      content: message,
    },
  });

  await prisma.userChatRoom.update({
    where: {
      userId_chatRoomId: { userId, chatRoomId },
    },
    data: {
      lastReadMessageId: message.id,
    },
  });

  res.status(200).json(chatMessage);
});
