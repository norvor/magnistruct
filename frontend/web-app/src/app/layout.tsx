import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/ReduxProvider";
import { ReactQueryProvider } from "@/lib/providers/ReactQueryProvider";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DynamicBackground } from "@/components/layout/DynamicBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Magnistruct - Enterprise Management Platform",
  description: "Modern HR, PM, and CRM solution for growing businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DynamicBackground />
          <ReduxProvider>
            <ReactQueryProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ReactQueryProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
