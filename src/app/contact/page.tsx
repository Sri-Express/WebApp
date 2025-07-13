// src/app/contact/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: ''
    });
    
    setTimeout(() => setShowSuccess(false), 5000);
  };

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
            <Link href="/about" style={{ color: '#6B7280', textDecoration: 'none' }}>About</Link>
            <Link href="/services" style={{ color: '#6B7280', textDecoration: 'none' }}>Services</Link>
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

      {/* Header */}
      <section style={{
        backgroundColor: 'white',
        padding: '4rem 1.5rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Contact Us
        </h1>
        <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
          We're here to help you with any questions, concerns, or feedback you may have.
        </p>
      </section>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Contact Methods */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📞</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Phone Support</h3>
            <p style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '0.5rem' }}>+94 11 234 5678</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>24/7 customer support hotline</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email Support</h3>
            <p style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '0.5rem' }}>support@sriexpress.lk</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>We respond within 2 hours</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Visit Our Office</h3>
            <p style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '0.5rem' }}>Colombo Main Office</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Open Mon-Fri 9AM-6PM</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Live Chat</h3>
            <p style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '0.5rem' }}>Available 24/7</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Chat with our support team</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {/* Contact Form */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Send us a Message
            </h2>

            {showSuccess && (
              <div style={{
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #10B981'
              }}>
                ✅ Thank you for your message! We'll get back to you within 2 hours.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select category</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="billing">Billing Issue</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of your inquiry"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Please provide details about your inquiry..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: isSubmitting ? '#9CA3AF' : '#F59E0B',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Office Locations */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Our Offices
            </h2>
            
            {[
              {
                city: 'Colombo',
                address: '123 Galle Road, Colombo 03',
                phone: '+94 11 234 5678',
                email: 'colombo@sriexpress.lk',
                hours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-2PM'
              },
              {
                city: 'Kandy',
                address: '456 Peradeniya Road, Kandy',
                phone: '+94 81 234 5678',
                email: 'kandy@sriexpress.lk',
                hours: 'Mon-Fri: 9AM-5PM, Sat: 9AM-1PM'
              },
              {
                city: 'Galle',
                address: '789 Wakwella Road, Galle',
                phone: '+94 91 234 5678',
                email: 'galle@sriexpress.lk',
                hours: 'Mon-Fri: 9AM-5PM'
              }
            ].map((office, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#F59E0B', marginBottom: '0.5rem' }}>
                  {office.city} Office
                </h3>
                <p style={{ color: '#4B5563', marginBottom: '0.5rem' }}>{office.address}</p>
                <p style={{ color: '#4B5563', marginBottom: '0.5rem' }}>📞 {office.phone}</p>
                <p style={{ color: '#4B5563', marginBottom: '0.5rem' }}>✉️ {office.email}</p>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>🕒 {office.hours}</p>
              </div>
            ))}

            {/* Emergency Contact */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#92400E', marginBottom: '0.5rem' }}>
                🚨 Emergency Support
              </h3>
              <p style={{ color: '#92400E', marginBottom: '0.5rem' }}>
                For urgent assistance outside business hours:
              </p>
              <p style={{ color: '#92400E', fontWeight: '600' }}>
                📞 +94 77 999 8888 (24/7 Emergency Line)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}