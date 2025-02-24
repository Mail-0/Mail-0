import MailComposeModal from "@/components/mail/mail-compose-modal";
import { Analytics } from "@vercel/analytics/react";
import { siteConfig } from "@/lib/site-config";
import { Toast } from "@/components/ui/toast";
import { Providers } from "@/lib/providers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { cn } from "@/lib/utils";
import { Suspense } from "react";
import "./globals.css";

export const metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(GeistSans.variable, GeistMono.variable)}>
        <Providers attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Suspense>
            <MailComposeModal />
          </Suspense>
          {children}
          <Toast />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
