import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ask Arny",
  description: "AI-powered questions and answers",
};

// 🔥 Helper to extract pathname from URL
function getPathnameFromUrl(headers: Headers) {
  const url = headers.get("x-url") || headers.get("referer") || "";
  try {
    return new URL(url, "http://localhost:3000").pathname;
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("connect.sid");
  const pathname = getPathnameFromUrl(await headers());

  const isLoginPage = pathname === "/login";
  const isAuthCallback = pathname.startsWith("/auth");

  if (!session && !isLoginPage && !isAuthCallback) {
    redirect("/login");
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
