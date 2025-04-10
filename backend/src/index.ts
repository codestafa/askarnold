// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import openAiRoutes from "./routes/openAiRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello, TypeScript with Express!");
});

// Mount the AI assistant routes
app.use("/", openAiRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/`));
