import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, PT_Serif } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@/components/ConnectButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const displayItalicAlt = PT_Serif({
  variable: "--font-display-italic-alt",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Intime",
  description: "A private gallery for holders.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${displayItalicAlt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}})();`}
        </Script>
        <ThemeProvider>
          <Providers>
            <header className="fixed top-0 left-0 z-50 p-6 sm:p-8">
              <ThemeToggle />
            </header>
            <header className="fixed top-0 right-0 z-50 p-6 sm:p-8">
              <ConnectButton />
            </header>
            <main className="flex-1">{children}</main>
            {modal}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
