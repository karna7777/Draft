import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

// Display — distinctive, architectural grotesque.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});
// Body — clean, modern.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
// Mono — dimensions, labels, technical readouts.
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Draft — Design the home you've imagined",
  description:
    "Draft is an AI residential design studio. Describe a home in plain words, watch it build itself in 3D, edit it in 2D/3D, and design every room — conceptually.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
