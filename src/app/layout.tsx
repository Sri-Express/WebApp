import { Metadata } from "next";
import { ThemeProvider } from "./context/ThemeContext"; // Correct import based on your folder structure
import "./globals.css";
import "./landing_styles.css";

export const metadata: Metadata = {
  title: "RideBookSL - Transportation Management",
  description: "Book transportation services across Sri Lanka",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* It's better practice to import Tailwind in globals.css rather than linking it here */}
      <head /> 
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}