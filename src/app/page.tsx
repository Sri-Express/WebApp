// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headerStyle = {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '1rem 0',
  };

  const navContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  };

  const navListStyle = {
    display: 'flex',
    gap: '1.5rem',
    listStyle: 'none',
  };

  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
  };

  const heroStyle = {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '5rem 0',
    textAlign: 'center' as const,
  };

  const heroContentStyle = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const heroTitleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  };

  const heroDescStyle = {
    fontSize: '1.25rem',
    maxWidth: '800px',
    margin: '0 auto 2rem',
    lineHeight: 1.6,
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  };

  const primaryButtonStyle = {
    backgroundColor: 'white',
    color: '#1a73e8',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  };

  const secondaryButtonStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontWeight: 'bold',
    border: '1px solid white',
    textDecoration: 'none',
  };

  const featuresStyle = {
    padding: '4rem 0',
    backgroundColor: '#f8f9fa',
  };

  const featuresTitleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '3rem',
    color: '#202124',
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const featureCardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  };

  const featureIconStyle = {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  };

  const featureTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#202124',
  };

  const featureDescStyle = {
    color: '#5f6368',
    lineHeight: 1.6,
  };

  const footerStyle = {
    backgroundColor: '#202124',
    color: 'white',
    padding: '2rem 0',
    marginTop: 'auto',
  };

  const footerContentStyle = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  };

  const footerLogoStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  };

  const footerDescStyle = {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const copyrightStyle = {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      {/* Header/Navigation */}
      <header style={headerStyle}>
        <div style={navContainerStyle}>
          <h1 style={logoStyle}>ශ්‍රී Express</h1>
          <nav>
            <ul style={navListStyle}>
              <li>
                <Link href="/login" style={navLinkStyle}>
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" style={navLinkStyle}>
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            Transportation Management System
          </h1>
          <p style={heroDescStyle}>
            A comprehensive platform for managing public and private transportation
            services throughout Sri Lanka
          </p>
          <div style={buttonContainerStyle}>
            <Link
              href="/register"
              style={primaryButtonStyle}
            >
              Get Started
            </Link>
            <Link
              href="#features"
              style={secondaryButtonStyle}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={featuresStyle}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={featuresTitleStyle}>
            Key Features
          </h2>
          <div style={featuresGridStyle}>
            {/* Feature 1 */}
            <div style={featureCardStyle}>
              <div style={featureIconStyle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#1a73e8"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>
              <h3 style={featureTitleStyle}>
                Real-Time Tracking
              </h3>
              <p style={featureDescStyle}>
                Track the location of buses and trains in real-time with updates
                every few seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={featureCardStyle}>
              <div style={featureIconStyle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#1a73e8"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              </div>
              <h3 style={featureTitleStyle}>
                Smart Scheduling
              </h3>
              <p style={featureDescStyle}>
                Easily create and manage transit schedules with convenient weekly
                and monthly templates.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={featureCardStyle}>
              <div style={featureIconStyle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#1a73e8"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>
              <h3 style={featureTitleStyle}>
                AI-Powered Support
              </h3>
              <p style={featureDescStyle}>
                Get intelligent customer support with our AI chatbot and seamless
                escalation to human agents when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={footerContentStyle}>
          <h2 style={footerLogoStyle}>ශ්‍රී Express</h2>
          <p style={footerDescStyle}>
            Transportation Management System
          </p>
          <p style={copyrightStyle}>
            &copy; {new Date().getFullYear()} ශ්‍රී Express. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}