import express, { Request, Response } from 'express';
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { db } from './config/db';
import "./config/passport";
import cookieParser from "cookie-parser";

dotenv.config();


const app = express();

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
  methods: ["GET", "POST"], 
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax", 
    secure: false, 
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello, TypeScript with Express!");
});

// 🔐 Google Auth Routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  (req, res) => {
    console.log("✅ Logged in user:", req.user);
    res.redirect("http://localhost:3000/");
  }
);

// 🔎 Check current authenticated user
app.get("/auth/me", (req, res) => {
  console.log("👉 auth/me cookies:", req.cookies);

  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// 🚪 Logout
app.post("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}/`));