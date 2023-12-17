import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import { authUser } from "../middlewares/auth-helper";
import { MessageResponse, getMessageResponse } from "../utils/chat-helper";

export const chatUrl = "/chat";
export const chatRouter = Router();

const MESSAGE_LIMIT = 50;

chatRouter.get(
  "/:chatRoomId",
  authUser,
  async (req: Request, res: Response) => {
    const { lastMessageId } = req.query;
    const { chatRoomId } = req.params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: Number(chatRoomId),
      },
    });

    if (!chatRoom) {
      res.status(404).json({ error: "ChatRoom not found" });
    }

    let messages: MessageResponse[];

    if (lastMessageId === undefined) {
      messages = await prisma.message.findMany({
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
        take: MESSAGE_LIMIT,
      });
    } else {
      messages = await prisma.message.findMany({
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
        cursor: {
          id: Number(lastMessageId),
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: 1,
        take: MESSAGE_LIMIT,
      });
    }

    if (!messages) {
      res.status(500).json({ error: "cannot fetch messages" });
    }

    const messagesToReturn = messages.map((message) => {
      return getMessageResponse(message);
    });

    res.status(200).json(messagesToReturn);
  }
);

chatRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { chatRoomId, message } = req.body;
  const userId = req.userId;

  try {
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
      include: {
        sender: {
          select: {
            profile: true,
          },
        },
      },
    });

    await prisma.userChatRoom.update({
      where: {
        userId_chatRoomId: { userId, chatRoomId },
      },
      data: {
        lastReadMessageId: chatMessage.id,
      },
    });

    if (!chatMessage) {
      res.status(500).json({ error: "cannot create message" });
    }

    const messageToReturn = getMessageResponse(chatMessage);

    res.status(200).json(messageToReturn);
  } catch (error) {
    res.status(500).json({ error: "error while creating chat message" });
  }
});
