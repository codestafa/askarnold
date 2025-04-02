import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  console.log("GET / request received"); // Debugging log
  res.status(200).send("Hello, TypeScript with Express!");
});

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/`));
