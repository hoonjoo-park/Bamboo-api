import axios from "axios";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prisma";

export const authUrl = "/auth";
export const authRouter = Router();

type SNSProviderId = "googleId" | "appleId" | "kakaoId";

const isValidProvider = (provider: string): provider is SNSProviderId => {
  return ["googleId", "appleId", "kakaoId"].includes(provider);
};

authRouter.post("/:provider", async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { accessToken } = req.body;

  try {
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
        id: data.sub.toString(),
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
        id: data.id.toString(),
        name: data.kakao_account.profile.nickname,
      };

      if (data.kakao_account.email) {
        profile = { ...profile, email: data.kakao_account.email };
      }
    } else {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }

    const providerId = `${provider}Id`;

    if (!isValidProvider(providerId)) {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }

    const user = await prisma.user.upsert({
      where: { [providerId]: profile.id },
      update: {},
      create: {
        [providerId]: profile.id,
        email: profile.email,
        name: profile.name,
        profile: {
          create: {
            username: `${profile.name}${Math.floor(Math.random() * 1000)}`,
          },
        },
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
