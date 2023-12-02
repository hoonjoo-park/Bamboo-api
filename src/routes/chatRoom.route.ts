import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import { authUser } from "../middlewares/auth-helper";
import { getChatRoomResponse } from "../utils/chat-helper";

export const chatRoomUrl = "/chatRoom";
export const chatRoomRouter = Router();

chatRoomRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { userId: opponentUserId } = req.body;
  const requestUserId = req.userId;

  try {
    const chatRoom = await prisma.chatRoom.create({
      data: {
        users: {
          createMany: {
            data: [{ userId: opponentUserId }, { userId: requestUserId }],
          },
        },
      },
    });

    if (!chatRoom) {
      res.status(404).json({ error: "ChatRoom not found" });
    }

    const userChatRoom = await prisma.userChatRoom.findFirst({
      where: {
        userId: requestUserId,
        chatRoomId: chatRoom.id,
      },
      include: {
        chatRoom: {
          include: {
            messages: {
              include: {
                sender: {
                  select: {
                    profile: true,
                  },
                },
              },
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
            users: {
              where: {
                userId: {
                  not: requestUserId,
                },
              },
              select: {
                user: {
                  select: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userChatRoom) {
      res.status(404).json({ error: "UserChatRoom not found" });
    }

    const chatRoomToReturn = getChatRoomResponse(userChatRoom);

    res.status(200).json(chatRoomToReturn);
  } catch (error) {
    console.error("Error while creating chatRoom:", error);
    res.status(500).json({ error: "Error while creating chatRoom" });
  }
});

chatRoomRouter.get("/", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  const chatRooms = await prisma.userChatRoom.findMany({
    where: {
      userId,
    },
    include: {
      chatRoom: {
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  profile: true,
                },
              },
            },
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
          users: {
            where: {
              userId: {
                not: userId,
              },
            },
            select: {
              user: {
                select: {
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!chatRooms) {
    res.status(404).json({ error: "ChatRoom not found" });
  }

  const chatRoomsToReturn = chatRooms.map((chatRoom) => {
    return getChatRoomResponse(chatRoom);
  });

  res.status(200).json(chatRoomsToReturn);
});

chatRoomRouter.patch(
  "/last-read-message",
  authUser,
  async (req: Request, res: Response) => {
    const { chatRoomId, lastMessageId } = req.body;
    const userId = req.userId;

    const chatRoom = await prisma.userChatRoom.update({
      where: { userId_chatRoomId: { chatRoomId, userId } },
      data: {
        lastReadMessageId: lastMessageId,
      },
    });

    if (!chatRoom) {
      res.status(404).json({ error: "ChatRoom not found" });
    }

    res.status(200).json(chatRoom);
  }
);

chatRoomRouter.delete(
  "/:chatRoomId",
  authUser,
  async (req: Request, res: Response) => {
    const { chatRoomId } = req.params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: Number(chatRoomId),
      },
      include: {
        users: true,
      },
    });

    if (!chatRoom) {
      res.status(404).json({ error: "ChatRoom not found" });
    }

    if (!chatRoom.users.find((user) => user.userId === req.userId)) {
      res.status(403).json({
        error: "You don't have any permission to delete this chatRoom",
      });
    }

    try {
      await prisma.userChatRoom.deleteMany({
        where: {
          chatRoomId: Number(chatRoomId),
        },
      });

      await prisma.chatRoom.delete({
        where: {
          id: Number(chatRoomId),
        },
      });

      res.status(200).json({ message: "ChatRoom deleted" });
    } catch (error) {
      console.error("Error while deleting chatRoom:", error);
      res.status(500).json({ error: "Error while deleting chatRoom" });
    }
  }
);
