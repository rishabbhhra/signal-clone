import type { Metadata } from "next";
import "./globals.css";
import { SignalProvider } from "@/context/SignalContext";

export const metadata: Metadata = {
  title: "Signal Messenger",
  description: "Secure, real-time private messaging platform",
  icons: {
    icon: "/favicon.ico",
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
