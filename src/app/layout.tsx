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
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning={true}>
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