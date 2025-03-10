import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { siteConfig } from "@/lib/site-config";
import { Toast } from "@/components/ui/toast";
import { Providers } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import "./globals.css";
import localFont from 'next/font/local'
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixy = localFont({ variable: '--font-pixy', src: '../public/fonts/PIXY.woff2' })

export const metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, pixy.variable, "antialiased")}>
        <Providers attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toast />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
