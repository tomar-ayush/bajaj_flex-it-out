import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "./providers/page";
import "./globals.css";


const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flex It Out | Bajaj",
  description: "Flex It Out",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
