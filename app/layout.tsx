import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Train Ticket Gallery",
  description: "A gallery showcasing train tickets",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeToggleButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
