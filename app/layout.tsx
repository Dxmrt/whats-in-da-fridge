import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "What's in da fridge",
    description: "Turn random ingredients into amazing recipes. Interactive fridge with AI-powered recipe suggestions. Built for degens who cook!",
    keywords: ["recipes", "cooking", "fridge", "ingredients", "farcaster", "base", "web3", "degens"],
    authors: [{ name: "By douxxiie" }],
    openGraph: {
      title: "What's in da fridge",
      description: "Turn random ingredients into amazing recipes. Built for degens who cook!",
      type: "website",
      siteName: "What's in da fridge",
      images: [
        {
          url: `${URL}/api/og`,
          width: 1200,
          height: 630,
          alt: "What's in da fridge - Recipe discovery app",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "What's in da fridge",
      description: "Turn random ingredients into amazing recipes. Built for degens who cook!",
      images: [`${URL}/api/og`],
    },
    other: {

      "base:app_id": "693db75fd77c069a945bde81",
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${URL}/og.png`,
        button: {
          title: "Open Fridge 🧊",
          action: {
            type: "launch_frame",
            name: "What's in da fridge",
            url: URL,
            splashImageUrl: `${URL}/splash.png`,
            splashBackgroundColor: "#ff6b9d",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
