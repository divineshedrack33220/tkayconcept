import type { Metadata } from "next";
import "./globals.css";

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
  other: {
    "theme-color": "#5A206D",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Inter',sans-serif]">{children}</body>
    </html>
  );
}
