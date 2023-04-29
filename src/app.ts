import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { authRouter, authUrl } from "./routes/auth.route";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(authUrl, authRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🎋 Bamboo Server is running on ${PORT}`));
