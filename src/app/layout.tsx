import { Metadata } from "next";
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
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@4.1.7/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}