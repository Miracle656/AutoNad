import type { Metadata } from "next";
import { Inter, Roboto_Mono, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Cursor } from "@/components/Cursor";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoNad — AI-Powered DeFi Trading on Monad",
  description:
    "Describe your strategy in plain English. AutoNad's AI agent places and executes limit orders on Monad — settled in under one second, non-custodial.",
};

export const viewport = {
  themeColor: "#0E091C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${robotoMono.variable} ${dmSans.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-surface text-white font-body overflow-x-hidden cursor-none antialiased">
        <Providers>
          <Cursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
