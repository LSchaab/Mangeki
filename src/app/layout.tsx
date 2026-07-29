import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LibraryProvider } from "@/context/LibraryContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mangeki — Lee manga, manhwa y manhua en español",
  description:
    "Mangeki es tu lector de manga, manhwa y manhua en español. Descubre nuevas historias, arma tu biblioteca y sumérgete en el Universo Mangeki.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LibraryProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </LibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
