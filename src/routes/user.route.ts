import { Request, Response, Router } from "express";
import prisma from "../../prisma/prisma";
import multer from "multer";
import { bucket } from "../app";
import { authUser } from "../middlewares/auth-helper";

export const userUrl = "/user";
export const userRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

userRouter.get("/me", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          username: true,
          profileImage: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

userRouter.put(
  "/me",
  authUser,
  upload.single("profileImage"),
  async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      const file = req.file;

      let imageUrl = null;

      if (file) {
        const imageName = `${req.userId}-${file.originalname}`;

        bucket
          .file(`profileImages/${imageName}`)
          .createWriteStream()
          .end(file.buffer);

        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/profileImages%2F${imageName}?alt=media`;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.userId },
        data: {
          profile: {
            update: {
              username,
              profileImage: imageUrl,
            },
          },
        },
        include: { profile: true },
      });

      res.status(200).json({
        username: updatedUser.profile.username,
        profileImage: updatedUser.profile.profileImage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error occurred during updating user" });
    }
  }
);

userRouter.delete("/me", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    await Promise.all([
      prisma.user.delete({ where: { id: userId } }),
      prisma.profile.delete({ where: { userId } }),
      prisma.post.deleteMany({ where: { authorId: userId } }),
      prisma.postLike.deleteMany({ where: { userId } }),
      prisma.comment.deleteMany({ where: { authorId: userId } }),
      prisma.chatRoomUser.deleteMany({ where: { userId: userId } }),
      prisma.message.deleteMany({ where: { senderId: userId } }),
      prisma.unregisterLog.create({ data: { userId } }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "회원탈퇴 처리 중, 오류가 발생했습니다." });
  }
});
