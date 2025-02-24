// app/layout.tsx
import MailComposeModal from "@/components/mail/mail-compose-modal";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { siteConfig } from "@/lib/site-config";
import { Toast } from "@/components/ui/toast";
import { Providers } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import "./globals.css";

// Import your CommandPaletteProvider
import { CommandPaletteProvider } from "@/components/context/command-palette-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
        <Providers attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CommandPaletteProvider>
            <Suspense>
              <MailComposeModal />
            </Suspense>
            {children}
            <Toast />
            <Analytics />
          </CommandPaletteProvider>
        </Providers>
      </body>
    </html>
  );
}
