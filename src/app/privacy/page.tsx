// src/app/privacy/page.tsx
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span>
            <span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <Link href="/contact" style={{ color: '#6B7280', textDecoration: 'none' }}>Contact</Link>
            <Link href="/login" style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none'
            }}>Login</Link>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Privacy Policy
        </h1>
        
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
          Last updated: January 15, 2025
        </p>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          lineHeight: '1.6'
        }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              We collect information you provide directly to us, such as when you create an account, 
              book a ticket, or contact us for support.
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Personal information (name, email, phone number)</li>
              <li>Travel preferences and booking history</li>
              <li>Payment information (processed securely)</li>
              <li>Location data for route tracking</li>
              <li>Device information and usage data</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              We use the information we collect to:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Provide and improve our transportation services</li>
              <li>Process bookings and payments</li>
              <li>Send you service updates and notifications</li>
              <li>Provide customer support</li>
              <li>Ensure safety and security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              3. Information Sharing
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information in the following circumstances:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>With your consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist us</li>
              <li>In case of business transfer or merger</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              4. Data Security
            </h2>
            <p style={{ color: '#4B5563' }}>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
              secure servers, and regular security audits.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              5. Your Rights
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              You have the right to:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Object to processing of your information</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              6. Cookies and Tracking
            </h2>
            <p style={{ color: '#4B5563' }}>
              We use cookies and similar technologies to improve your experience, analyze usage, 
              and provide personalized content. You can control cookie settings through your browser.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              7. Data Retention
            </h2>
            <p style={{ color: '#4B5563' }}>
              We retain your information for as long as necessary to provide our services and comply 
              with legal obligations. You can request deletion of your account at any time.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              8. Children's Privacy
            </h2>
            <p style={{ color: '#4B5563' }}>
              Our services are not intended for children under 13. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              9. Changes to This Policy
            </h2>
            <p style={{ color: '#4B5563' }}>
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              10. Contact Us
            </h2>
            <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Email: privacy@sriexpress.lk</li>
              <li>Phone: +94 11 234 5678</li>
              <li>Address: 123 Galle Road, Colombo 03, Sri Lanka</li>
            </ul>
          </section>
        </div>

        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <p style={{ color: '#92400E', margin: 0 }}>
            <strong>Note:</strong> This privacy policy is compliant with Sri Lankan data protection 
            laws and international standards. For specific legal queries, please consult with our 
            legal department.
          </p>
        </div>
      </div>
    </div>
  );
}