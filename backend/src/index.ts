import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import openAiRoutes from "./routes/openAiRoutes";
import "./config/passport";
import communityRoutes from './routes/communityRoutes';
import uploadRoutes from './routes/uploadRoutes';
import commentRoutes from "./routes/commentRoutes";
import axios from "axios";
import {db} from "../src/db/db"; // adjust path to your actual knex instance
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "lax", secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Hello, TypeScript with Express!");
});

app.use("/", openAiRoutes);

app.use('/api', communityRoutes);

app.use('/api', commentRoutes);

app.use('/api', uploadRoutes);

// 🔐 Google Auth Routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req: Request, res: Response) => {
    if (!req.user) {
      res.redirect("http://localhost:3000/login");
      return;
    }

    const profile: any = req.user; // cast to any for now
    const numericId = parseInt(profile.id, 10);

    if (isNaN(numericId)) {
      console.error("Invalid profile.id:", profile.id);
      res.status(500).send("Authentication error");
      return;
    }

    req.session.userId = numericId;
    console.log("✔️ session.userId =", numericId);

    res.redirect("http://localhost:3000/");
  }
);

app.get("/auth/me", (req: Request, res: Response) => {
  console.log("✅ Full req.user profile =", req.user);

  if (req.isAuthenticated() && req.user) {
    const profile: any = req.user;

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    };

    console.log("✅ Normalized user =", user);
    res.json(user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.post("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

app.get("/server_info", async (_req: Request, res: Response) => {
  try {
    const { data: server_geodata } = await axios.get("https://ipwhois.app/json/");

    let dbInfo = {
      connected: false,
      version: null as string | null,
      tables: [] as string[],
    };

    try {
      const versionResult = await db.raw("SELECT version();");
      const tablesResult = await db.raw(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
      `);

      dbInfo = {
        connected: true,
        version: versionResult.rows?.[0]?.version || "unknown",
        tables: tablesResult.rows.map((row: any) => row.table_name),
      };
    } catch (err) {
      if (err instanceof Error) {
        console.error("Database connection failed:", err.message);
      } else {
        console.error("Database connection failed:", err);
      }
    }

    const server_info = {
      server_geodata,
      settings: {
        env: process.env.NODE_ENV || "development",
        appName: "MyNodeApp",
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
      },
      database: dbInfo,
    };

    res.json(server_info);
  } catch (error) {
    console.error("Failed to fetch server_info:", error);
    res.status(500).json({ error: "Could not retrieve server info." });
  }
});



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/`);
});
