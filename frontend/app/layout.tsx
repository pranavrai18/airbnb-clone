import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { SearchProvider } from "@/context/SearchContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb Clone — Vacation Rentals, Homes, Experiences",
  description: "Find the perfect place to stay at an amazing price in 191 countries. Belong anywhere with Airbnb.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-900 font-sans transition-colors duration-200" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <ThemeProvider>
          <UserProvider>
            <CategoryProvider>
              <SearchProvider>
                <ToastProvider>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </ToastProvider>
              </SearchProvider>
            </CategoryProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
