import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TickerTape from "@/components/TickerTape";

export const metadata: Metadata = {
  title: "Petjo Trade App",
  description: "A stock tracking and paper-trading dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-board">
        <TickerTape />
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
