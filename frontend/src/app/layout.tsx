import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5A206D",
  viewportFit: "cover",
};

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
    title: "TKAYKONCEPTS INT'L | Faith. Purpose. Identity.",
    description: "Creating products that inspire people to live boldly and purposefully.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TKAYKONCEPTS",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-['Inter',sans-serif] safe-area-top">{children}</body>
    </html>
  );
}
