import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import openAiRoutes from "./routes/openAiRoutes";
import "./config/passport";

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

app.get(
  "/auth/google",
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

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/`);
});
