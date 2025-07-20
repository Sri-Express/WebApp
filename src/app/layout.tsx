import type { Metadata } from "next";
import { ThemeProvider } from "./context/ThemeContext";
import RealTimeEmergencyClient from "./components/RealTimeEmergencyClient";
import UserEmergencyAlerts from "./components/UserEmergencyAlerts";
import NotificationPermissions from "./components/NotificationPermissions";
import "./globals.css";
import "./landing_styles.css";

export const metadata: Metadata = {
  title: "ශ්‍රී Express - Transportation Management",
  description: "Book transportation services across Sri Lanka with real-time emergency alerts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // By returning <html>, Next.js knows you want to control it.
  // This is the correct place to add suppressHydrationWarning.
  // Next.js will automatically inject the <head> from metadata and a <body> tag.
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider>
          <RealTimeEmergencyClient
            enableSound={true}
            enablePushNotifications={true}
          >
            <NotificationPermissions />
            <UserEmergencyAlerts />
            {children}
          </RealTimeEmergencyClient>
        </ThemeProvider>
      </body>
    </html>
  );
}