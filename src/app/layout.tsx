import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { Provider } from "./provider";
import { Footer } from "@/components/global/footer";

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
      <body
        className={`${sora.className}`}
        style={{
          zIndex: -1,
          width: "100vw",
          height: "100vh",
        }}>
        <Provider cookies={cookies}>
          <Toaster />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
