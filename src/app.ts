import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { authRouter, authUrl } from "./routes/auth.route";
import morgan from "morgan";
import { userRouter, userUrl } from "./routes/user.route";
import admin from "firebase-admin";
import { articleRouter, articleUrl } from "./routes/article.route";
import { locationRouter, locationUrl } from "./routes/location.route";
import { commentRouter, commentUrl } from "./routes/comment.route";

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🎋 Bamboo Server is running on ${PORT}`));
