import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/shared/InstallPrompt";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeLink Rwanda | All-in-One Property Management Platform",
  description:
    "HomeLink Rwanda helps property owners and managers simplify operations, keep tenants happy and grow their rental business - all in one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HomeLink",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          {children}
          <ServiceWorkerRegistration />
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
