import { Request, Response, Router } from "express";
import axios from "axios";
import prisma from "../../prisma/prisma";
import jwt from "jsonwebtoken";

export const authUrl = "/auth";
export const authRouter = Router();

authRouter.post("/:provider", async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { accessToken } = req.body;

  try {
    console.log("hello");
    let profile;

    if (provider === "google") {
      const { data } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      profile = {
        id: data.sub,
        email: data.email,
        name: data.name,
      };
    } else if (provider === "kakao") {
      const { data } = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      profile = {
        id: data.id,
        email: data.kakao_account.email,
        name: data.kakao_account.profile.nickname,
      };
    } else {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }

    const user = await prisma.user.upsert({
      where: { [`${provider}Id`]: profile.id },
      update: {},
      create: {
        [`${provider}Id`]: profile.id,
        email: profile.email,
        name: profile.name,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.SALT, {
      expiresIn: "3 days",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
