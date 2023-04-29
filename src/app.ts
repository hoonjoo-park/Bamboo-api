import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { authRouter, authUrl } from "./routes/auth.route";

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use(authUrl, authRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🎋 Bamboo Server is running on ${PORT}`));
