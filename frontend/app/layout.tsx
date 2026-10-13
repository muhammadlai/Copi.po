import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copi.po AI Host | Aitzaz AI",
  description: "Chromebook-first browser preview for the Copi.po AI virtual LIVE host.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
