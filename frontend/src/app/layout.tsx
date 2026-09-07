import type { Metadata } from "next";
import "./globals.css";
import { SignalProvider } from "@/context/SignalContext";

export const metadata: Metadata = {
  title: "Signal",
  description: "Signal - Fast, Simple, Secure Messaging",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden antialiased">
        <SignalProvider>{children}</SignalProvider>
      </body>
    </html>
  );
}
