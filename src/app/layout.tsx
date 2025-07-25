import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: 'Drone Survey UI',
  description: 'Phase 0 — Scaffold',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}