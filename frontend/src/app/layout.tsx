import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TKAYKONCEPTS INT'L | Faith. Purpose. Identity.",
    template: "%s | TKAYKONCEPTS INT'L",
  },
  description:
    "Creating products that inspire people to live boldly and purposefully. Shop books, games, apparel, and custom printing.",
  keywords: ["faith", "purpose", "identity", "christian", "apparel", "books", "games", "custom printing"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TKAYKONCEPTS INT'L",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
