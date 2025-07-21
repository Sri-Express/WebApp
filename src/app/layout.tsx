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

// SOLUTION 1: Move suppressHydrationWarning to body tag instead of html
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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

// SOLUTION 2: Use useEffect to handle client-side only content
/* 
import { useEffect, useState } from 'react';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientOnly>
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
        </ClientOnly>
      </body>
    </html>
  );
}
*/

// SOLUTION 3: Add script to prevent extension interference (add to head)
/*
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent extensions from modifying the body during hydration
              if (typeof window !== 'undefined') {
                const originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  if (this.tagName === 'BODY' && (name.startsWith('data-gr-') || name.startsWith('data-new-gr-'))) {
                    setTimeout(() => originalSetAttribute.call(this, name, value), 0);
                    return;
                  }
                  return originalSetAttribute.call(this, name, value);
                };
              }
            `,
          }}
        />
      </head>
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
*/