// src/app/help/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'booking', name: 'Booking & Tickets' },
    { id: 'tracking', name: 'Bus Tracking' },
    { id: 'payment', name: 'Payments' },
    { id: 'account', name: 'Account' },
    { id: 'technical', name: 'Technical Issues' }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'tracking',
      question: 'How do I track my bus in real-time?',
      answer: 'Download our mobile app or visit our website. Enter your route number or search by destination to see live bus locations and arrival times.'
    },
    {
      id: 2,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit/debit cards, mobile payments (PayHere, Dialog eZ Cash), and our digital wallet.'
    },
    {
      id: 3,
      category: 'booking',
      question: 'How do I book a ticket?',
      answer: 'You can book tickets through our mobile app, website, or at physical ticket counters. Online booking is available 24/7.'
    },
    {
      id: 4,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the OTP verification process.'
    },
    {
      id: 5,
      category: 'technical',
      question: 'The app is not working properly',
      answer: 'Try clearing app cache, updating to the latest version, or restarting your device. Contact support if issues persist.'
    },
    {
      id: 6,
      category: 'booking',
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes, you can cancel or modify bookings up to 30 minutes before departure time through the app or website.'
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          Help Center
        </h1>
        <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
          Find answers to your questions and get help with Sri Express services
        </p>
      </section>

      {/* Search and Categories */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                border: 'none',
                backgroundColor: selectedCategory === category.id ? '#F59E0B' : '#f3f4f6',
                color: selectedCategory === category.id ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div style={{ space: '1rem' }}>
          {filteredFAQs.map(item => (
            <details
              key={item.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                padding: '1rem'
              }}
            >
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                color: '#1F2937',
                fontSize: '1.1rem'
              }}>
                {item.question}
              </summary>
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f3f4f6',
                color: '#4B5563',
                lineHeight: '1.6'
              }}>
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6B7280'
          }}>
            No help articles found. Try a different search term or category.
          </div>
        )}
      </section>

      {/* Contact Support */}
      <section style={{
        backgroundColor: 'white',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        marginTop: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Still need help?
        </h2>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
          Can't find what you're looking for? Contact our support team.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Contact Support
          </Link>
          <a href="tel:+94112345678" style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Call: +94 11 234 5678
          </a>
        </div>
      </section>
    </div>
  );
}