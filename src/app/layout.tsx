import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  absoluteUrl,
  buildWebsiteJsonLd,
  getSiteUrl,
  serializeJsonLd,
  siteAuthor,
  siteDescription,
  siteName,
  siteTagline,
} from "@/lib/seo";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const fraunces = localFont({
  variable: "--font-fraunces",
  src: [
    {
      path: "./fonts/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./fonts/Fraunces-Italic-VariableFont_SOFT,WONK,opsz,wght.ttf",
      weight: "300 900",
      style: "italic",
    },
  ],
  display: "swap",
});

const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    {
      path: "./fonts/CormorantGaramond-VariableFont_wght.ttf",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "./fonts/CormorantGaramond-Italic-VariableFont_wght.ttf",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "swap",
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  src: [
    {
      path: "./fonts/JetBrainsMono-VariableFont_wght.ttf",
      weight: "100 800",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Italic-VariableFont_wght.ttf",
      weight: "100 800",
      style: "italic",
    },
  ],
  display: "swap",
});

const notoNaskhArabic = localFont({
  variable: "--font-noto-naskh-arabic",
  src: "./fonts/NotoNaskhArabic-VariableFont_wght.ttf",
  weight: "400 700",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: siteName,
  title: {
    default: `${siteName}, ${siteTagline}`,
    template: `%s / ${siteName}`,
  },
  description: siteDescription,
  authors: [{ name: siteAuthor }],
  creator: siteAuthor,
  publisher: siteName,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: `${siteName}, ${siteTagline}`,
    description: siteDescription,
    url: getSiteUrl().origin,
    siteName,
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_LB"],
    images: [
      {
        url: absoluteUrl("/brand/la-primary-lockup.png"),
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName}, ${siteTagline}`,
    description: siteDescription,
    images: [absoluteUrl("/brand/la-primary-lockup.png")],
  },
  keywords: [
    "Lebanon",
    "Beirut",
    "Lebanese politics",
    "sectarianism",
    "Middle East",
    "long essays",
    "political economy",
    "Hezbollah",
    "Taif",
    "diaspora",
    "Levant",
    "Karim Salam",
  ],
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff1e0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1410" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${cormorant.variable} ${jetbrainsMono.variable} ${notoNaskhArabic.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildWebsiteJsonLd()),
          }}
        />
        {children}
      </body>
    </html>
  );
}
