import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🎋 Bamboo Server is running on ${PORT}`));
