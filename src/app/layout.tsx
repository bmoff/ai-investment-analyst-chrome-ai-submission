import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/shared/contexts/FavoritesContext";
import { JobsProvider } from "@/shared/contexts/JobsContext";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.NAME,
  description: APP_CONFIG.DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Chrome AI Writer API Origin Trial Token */}
        <meta httpEquiv="origin-trial" content={APP_CONFIG.CHROME_AI.ORIGIN_TRIAL_TOKEN} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <FavoritesProvider>
            <JobsProvider>
              {children}
            </JobsProvider>
          </FavoritesProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
