import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Arts",
  description: "Curated digital art, printables, and creative learning products.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
