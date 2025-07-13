// src/app/terms/page.tsx
import Link from 'next/link';

export default function TermsPage() {
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
          Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p style={{ color: '#4B5563' }}>
              By accessing and using Sri Express services, you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              2. Service Description
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              Sri Express provides transportation management services including:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Bus and train tracking services</li>
              <li>Online ticket booking and payment</li>
              <li>Route information and schedules</li>
              <li>Mobile application services</li>
              <li>Customer support services</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              3. User Responsibilities
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              As a user of our services, you agree to:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Provide accurate and truthful information</li>
              <li>Use services in accordance with applicable laws</li>
              <li>Not misuse or abuse our services</li>
              <li>Respect other users and staff</li>
              <li>Pay for services as agreed</li>
              <li>Follow safety guidelines and regulations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              4. Booking and Payment Terms
            </h2>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              4.1 Booking Policy
            </h3>
            <ul style={{ paddingLeft: '2rem', marginBottom: '1rem', color: '#4B5563' }}>
              <li>Bookings are subject to availability</li>
              <li>Confirmation is required for all bookings</li>
              <li>Changes must be made at least 30 minutes before departure</li>
            </ul>
            
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              4.2 Payment Terms
            </h3>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Payment is required at time of booking</li>
              <li>We accept various payment methods as displayed</li>
              <li>Refunds are processed according to our refund policy</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              5. Cancellation and Refund Policy
            </h2>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li><strong>Free cancellation:</strong> Up to 2 hours before departure</li>
              <li><strong>50% refund:</strong> 30 minutes to 2 hours before departure</li>
              <li><strong>No refund:</strong> Less than 30 minutes before departure</li>
              <li><strong>Service cancellation:</strong> Full refund if we cancel the service</li>
              <li><strong>Weather/Emergency:</strong> Refund or rescheduling options available</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              6. Limitation of Liability
            </h2>
            <p style={{ color: '#4B5563' }}>
              Sri Express shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including but not limited to loss of profits, data, or other 
              intangible losses resulting from your use of our services.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              7. Safety and Conduct
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4B5563' }}>
              For the safety and comfort of all passengers:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Follow all safety instructions</li>
              <li>No smoking or alcohol consumption</li>
              <li>Maintain appropriate behavior</li>
              <li>Report any safety concerns immediately</li>
              <li>Respect other passengers and staff</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              8. Intellectual Property
            </h2>
            <p style={{ color: '#4B5563' }}>
              All content, trademarks, and intellectual property on our platform are owned by 
              Sri Express or our licensors. You may not use, copy, or distribute any content 
              without our written permission.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              9. Privacy and Data Protection
            </h2>
            <p style={{ color: '#4B5563' }}>
              Your privacy is important to us. Please review our Privacy Policy to understand 
              how we collect, use, and protect your personal information.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              10. Service Availability
            </h2>
            <p style={{ color: '#4B5563' }}>
              We strive to provide uninterrupted service but cannot guarantee 100% uptime. 
              Services may be temporarily unavailable due to maintenance, technical issues, 
              or circumstances beyond our control.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              11. Modifications to Terms
            </h2>
            <p style={{ color: '#4B5563' }}>
              We reserve the right to modify these terms at any time. Changes will be posted 
              on this page with an updated revision date. Your continued use of our services 
              constitutes acceptance of any changes.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              12. Governing Law
            </h2>
            <p style={{ color: '#4B5563' }}>
              These terms shall be governed by and construed in accordance with the laws of 
              Sri Lanka. Any disputes shall be resolved in the courts of Sri Lanka.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>
              13. Contact Information
            </h2>
            <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
              For questions about these Terms of Service, contact us:
            </p>
            <ul style={{ paddingLeft: '2rem', color: '#4B5563' }}>
              <li>Email: legal@sriexpress.lk</li>
              <li>Phone: +94 11 234 5678</li>
              <li>Address: 123 Galle Road, Colombo 03, Sri Lanka</li>
            </ul>
          </section>
        </div>

        <div style={{
          backgroundColor: '#DBEAFE',
          border: '1px solid #3B82F6',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <p style={{ color: '#1E40AF', margin: 0 }}>
            <strong>Important:</strong> By using Sri Express services, you acknowledge that you 
            have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}