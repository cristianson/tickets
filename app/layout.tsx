import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import TiltButton from "@/components/ui/tiltButton";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ticket Gallery",
  description: "A collection of real public transport tickets from cities I have visited. Flip each one to see both sides.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181D27" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TiltButton />
          <ThemeToggleButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
