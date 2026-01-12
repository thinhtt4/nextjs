import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import BackgroundMusic from "./components/BackgroundMusic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ve Chai Công Nghệ",
    description: "Hệ thống thu gom phế liệu AI",
    manifest: "/manifest.json", // Quan trọng
    themeColor: "#16a34a",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Ve Chai Tech",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 <html lang="en" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundMusic/>
        <Header />
        {children}
      </body>
    </html>
  );
}
