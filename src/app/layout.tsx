import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { Provider } from "./provider";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  preload: true,
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en">
      <head>
        <Script src="web-sdk-version-3.2.0.0.js" strategy="beforeInteractive" />
        <Script src="/lib/VNPTQRBrowserApp.js" strategy="beforeInteractive" />
        <Script src="/lib/VNPTBrowserSDKAppV4.0.0.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${sora.className}`}
        style={{
          zIndex: -1,
        }}>
        <Provider cookies={cookies}>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  );
}