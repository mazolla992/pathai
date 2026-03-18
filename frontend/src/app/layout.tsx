import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathAI — AI-навигатор по профессиям",
  description: "Узнай свою профессию за 10 минут с помощью AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
