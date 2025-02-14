import { ThemeProvider } from "@/components/dashboard/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";


const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flex It Out | Bajaj",
  description: "Flex It Out",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body className={inter.className}>
       <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
    </body>
    </html>
  );
}
