import { Request, Response, Router } from "express";
import { authUser } from "../middlewares/auth-helper";
import prisma from "../../prisma/prisma";

export const chatRoomUrl = "/chatRoom";
export const chatRoomRouter = Router();

chatRoomRouter.post("/", authUser, async (req: Request, res: Response) => {
  const { userId } = req.body;
  const senderId = req.userId;

  try {
    const chatRoom = await prisma.chatRoom.create({
      data: {
        users: {
          create: [{ userId }, { userId: senderId }],
        },
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

    const chatRoomToReturn = {
      ...chatRoom,
      users: chatRoom.users.map((user) => ({
        profile: user.user.profile,
        lastCheck: user.lastCheck,
      })),
    };

    res.status(200).json(chatRoomToReturn);
  } catch (error) {
    console.error("Error while creating chatRoom:", error);
    res.status(500).json({ error: "Error while creating chatRoom" });
  }
});

chatRoomRouter.get("/", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      users: { some: { userId } },
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

  const chatRoomsToReturn = await Promise.all(
    chatRooms.map(async (chatRoom) => {
      const users = chatRoom.users.map((user) => {
        return {
          profile: user.user.profile,
          lastCheck: user.lastCheck,
        };
      });

      if (chatRoom.latestMessageId === null) {
        return {
          ...chatRoom,
          users,
        };
      }

      const latestMessage = await prisma.message.findFirst({
        where: {
          id: chatRoom.latestMessageId,
        },
      });

      return {
        ...chatRoom,
        latestMessage,
        users,
      };
    })
  );

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
      res
        .status(403)
        .json({ error: "You don't have permission to delete this chatRoom" });
    }

    try {
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
