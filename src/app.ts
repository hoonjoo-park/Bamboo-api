import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import admin from "firebase-admin";
import morgan from "morgan";
import { articleRouter, articleUrl } from "./routes/article.route";
import { authRouter, authUrl } from "./routes/auth.route";
import { commentRouter, commentUrl } from "./routes/comment.route";
import { locationRouter, locationUrl } from "./routes/location.route";
import { userRouter, userUrl } from "./routes/user.route";
import { chatRoomRouter, chatRoomUrl } from "./routes/chatRoom.route";
import { chatRouter, chatUrl } from "./routes/chat.route";

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = require("../firebase-service-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://bamboo-7955e.appspot.com/",
});

export const bucket = admin.storage().bucket();

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(authUrl, authRouter);
app.use(userUrl, userRouter);
app.use(articleUrl, articleRouter);
app.use(commentUrl, commentRouter);
app.use(locationUrl, locationRouter);
app.use(chatRoomUrl, chatRoomRouter);
app.use(chatUrl, chatRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🎋 Bamboo Server is running on ${PORT}`));
