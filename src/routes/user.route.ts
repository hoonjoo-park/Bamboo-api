import { Request, Response, Router } from "express";
import multer from "multer";
import prisma from "../../prisma/prisma";
import { bucket } from "../app";
import { authUser } from "../middlewares/auth-helper";
import { UserSelect } from "../utils/selects";

export const userUrl = "/user";
export const userRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

userRouter.get("/me", authUser, async (req: Request, res: Response) => {
  const userId = req.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...UserSelect },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
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

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { profile: true },
      });

      if (user && user.profile.profileImage) {
        const profileImageUrl = user.profile.profileImage;
        const matched = profileImageUrl.match(
          /profileImages%2F(.*?)\?alt=media/
        );
        const imageName = matched ? matched[1] : null;

        if (imageName) {
          await bucket.file(`profileImages/${imageName}`).delete();
        }
      }

      if (file) {
        const imageName = `${req.userId}-${Math.round(Math.random() * 10000)}-${
          file.originalname
        }`;

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
      prisma.article.deleteMany({ where: { authorId: userId } }),
      prisma.articleLike.deleteMany({ where: { userId } }),
      prisma.comment.deleteMany({ where: { authorId: userId } }),
      prisma.message.deleteMany({ where: { senderId: userId } }),
      prisma.unregisterLog.create({ data: { userId } }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "회원탈퇴 처리 중, 오류가 발생했습니다." });
  }
});
