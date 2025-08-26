// src/app/qr/[bookingId]/page.tsx - QR Code Display Page with PDF and Email
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheckIcon, ArrowDownTrayIcon, EnvelopeIcon, PrinterIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Booking {
  _id: string;
  bookingId: string;
  routeId: any;
  travelDate: string;
  departureTime: string;
  passengerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  seatInfo: {
    seatNumber: string;
    seatType: string;
  };
  pricing: {
    totalAmount: number;
    currency: string;
  };
  paymentInfo: {
    transactionId: string;
  };
  status: string;
}

export default function QRCodePage() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const qrRef = useRef<HTMLDivElement>(null);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  // Theme styles
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const bookingId = params.bookingId as string;

  useEffect(() => {
    const loadBookingAndQR = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Load booking details
        const bookingResponse = await fetch(`${baseURL}/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!bookingResponse.ok) {
          throw new Error('Failed to load booking details');
        }

        const bookingData = await bookingResponse.json();
        setBooking(bookingData.booking);

        // Generate QR code
        const qrResponse = await fetch(`${baseURL}/api/bookings/${bookingId}/qr`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          setQrCode(qrData.qrCode);
        } else {
          // Fallback: Generate QR code using external service
          const qrText = `SRI-EXPRESS-${bookingId}-${bookingData.booking.passengerInfo.name}-${bookingData.booking.seatInfo.seatNumber}`;
          const fallbackQR = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrText)}`;
          setQrCode(fallbackQR);
        }

      } catch (err) {
        console.error('Error loading booking/QR:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    loadBookingAndQR();
  }, [bookingId, router]);

  const downloadAsPDF = async () => {
    if (!booking || !qrCode) return;
    
    setDownloading(true);
    try {
      // Create HTML content for PDF
      const printContent = `
        <html>
          <head>
            <title>Sri Express - Ticket</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
              .ticket { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
              .header { background: linear-gradient(135deg, #F59E0B, #EF4444); color: white; padding: 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 5px 0 0 0; opacity: 0.9; }
              .content { padding: 30px; }
              .qr-section { text-align: center; margin: 20px 0; }
              .qr-code { border: 3px solid #F59E0B; border-radius: 8px; padding: 10px; display: inline-block; }
              .details { margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; color: #666; }
              .detail-value { color: #333; }
              .important { background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #F59E0B; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <h1>ශ්‍රී Express</h1>
                <p>Electronic Ticket</p>
              </div>
              <div class="content">
                <div class="qr-section">
                  <img src="${qrCode}" alt="QR Code" class="qr-code" style="max-width: 200px;" />
                  <p style="margin-top: 10px; color: #666; font-size: 14px;">Show this QR code to the conductor</p>
                </div>
                
                <div class="details">
                  <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${booking.bookingId}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Passenger:</span>
                    <span class="detail-value">${booking.passengerInfo.name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Route:</span>
                    <span class="detail-value">${booking.routeId?.name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(booking.travelDate).toLocaleDateString()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Departure:</span>
                    <span class="detail-value">${booking.departureTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Seat:</span>
                    <span class="detail-value">${booking.seatInfo.seatNumber} (${booking.seatInfo.seatType})</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">Rs. ${booking.pricing.totalAmount.toLocaleString()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Transaction:</span>
                    <span class="detail-value">${booking.paymentInfo.transactionId}</span>
                  </div>
                </div>
                
                <div class="important">
                  <strong>Important Instructions:</strong><br>
                  • Present this QR code for verification<br>
                  • Arrive 15 minutes before departure<br>
                  • Carry valid ID matching passenger name<br>
                  • Contact support: +94 11 123 4567
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([printContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sri-Express-Ticket-${booking.bookingId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Also offer to print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      }

    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const sendByEmail = async () => {
    if (!booking || !qrCode) return;
    
    setEmailing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to send email');
        return;
      }

      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const emailResponse = await fetch(`${baseURL}/api/bookings/${bookingId}/email-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: booking.passengerInfo.email,
          qrCode: qrCode
        })
      });

      if (emailResponse.ok) {
        alert(`Ticket sent successfully to ${booking.passengerInfo.email}`);
      } else {
        const errorData = await emailResponse.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email. Please try again or contact support.');
    } finally {
      setEmailing(false);
    }
  };

  const printTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(251, 191, 36, 0.3)', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '16px' }}>Loading ticket...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: '#DC2626', marginBottom: '1rem' }}>Ticket Not Found</h2>
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1.5rem' }}>{error || 'Unable to load ticket details'}</p>
          <Link href="/bookings" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600' }}>Back to Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }
        .print-only { display: none; }
      `}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Navigation */}
        <nav className="no-print" style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
              </h1>
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ThemeSwitcher />
              <Link href="/bookings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>
                <ArrowLeftIcon width={16} height={16} />
                Back to Bookings
              </Link>
            </div>
          </div>
        </nav>

        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Print Header - Only shows when printing */}
          <div className="print-only" style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #F59E0B', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#F59E0B', margin: 0 }}>ශ්‍රී Express</h1>
            <p style={{ margin: '0.5rem 0', color: '#666' }}>Electronic Ticket</p>
          </div>

          {/* Main Ticket Card */}
          <div ref={qrRef} style={{ backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white', padding: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Your E-Ticket</h1>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Booking #{booking.bookingId}</p>
            </div>

            {/* QR Code Section */}
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: '1rem', background: 'white', borderRadius: '12px', border: '3px solid #F59E0B', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
                <Image 
                  src={qrCode} 
                  alt="Ticket QR Code" 
                  width={250}
                  height={250}
                  style={{ maxWidth: '250px', width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
              <p style={{ marginTop: '1rem', color: currentThemeStyles.textSecondary, fontSize: '1.1rem', fontWeight: '500' }}>
                Show this QR code to the conductor
              </p>
            </div>

            {/* Ticket Details */}
            <div style={{ padding: '0 2rem 2rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', padding: '1.5rem', backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(249, 250, 251, 0.8)', borderRadius: '0.5rem' }}>
                  
                  {/* Passenger Details */}
                  <div>
                    <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.1rem', fontWeight: '600', margin: '0 0 1rem 0', borderBottom: '2px solid #F59E0B', paddingBottom: '0.5rem' }}>Passenger Details</h3>
                    <div style={{ color: currentThemeStyles.textSecondary, lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '0.5rem' }}><strong>Name:</strong> {booking.passengerInfo.name}</div>
                      <div style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> {booking.passengerInfo.phone}</div>
                      <div><strong>Email:</strong> {booking.passengerInfo.email}</div>
                    </div>
                  </div>

                  {/* Journey Details */}
                  <div>
                    <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.1rem', fontWeight: '600', margin: '0 0 1rem 0', borderBottom: '2px solid #F59E0B', paddingBottom: '0.5rem' }}>Journey Details</h3>
                    <div style={{ color: currentThemeStyles.textSecondary, lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '0.5rem' }}><strong>Route:</strong> {booking.routeId?.name || 'N/A'}</div>
                      <div style={{ marginBottom: '0.5rem' }}><strong>Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</div>
                      <div style={{ marginBottom: '0.5rem' }}><strong>Departure:</strong> {booking.departureTime}</div>
                      <div><strong>Seat:</strong> {booking.seatInfo.seatNumber} ({booking.seatInfo.seatType})</div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.1rem', fontWeight: '600', margin: '0 0 1rem 0', borderBottom: '2px solid #F59E0B', paddingBottom: '0.5rem' }}>Payment Details</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ color: currentThemeStyles.textSecondary }}>
                        <div><strong>Amount Paid:</strong> Rs. {booking.pricing.totalAmount.toLocaleString()}</div>
                        <div style={{ marginTop: '0.5rem' }}><strong>Transaction ID:</strong> {booking.paymentInfo.transactionId}</div>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>CONFIRMED</div>
                    </div>
                  </div>
                </div>

                {/* Important Instructions */}
                <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderLeft: '4px solid #F59E0B', borderRadius: '0.5rem', padding: '1.5rem' }}>
                  <h4 style={{ color: '#92400E', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Important Instructions</h4>
                  <ul style={{ color: '#92400E', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                    <li>Present this QR code for verification before boarding</li>
                    <li>Arrive at the departure point 15 minutes early</li>
                    <li>Carry valid photo ID matching the passenger name</li>
                    <li>Contact support at +94 11 123 4567 for assistance</li>
                    <li>This ticket is non-transferable and valid only for the specified journey</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            
            <button
              onClick={downloadAsPDF}
              disabled={downloading}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: downloading ? '#9CA3AF' : '#3B82F6', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: downloading ? 'not-allowed' : 'pointer', 
                fontSize: '1rem', 
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowDownTrayIcon width={20} height={20} />
              {downloading ? 'Generating...' : 'Download as PDF'}
            </button>

            <button
              onClick={sendByEmail}
              disabled={emailing}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: emailing ? '#9CA3AF' : '#10B981', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: emailing ? 'not-allowed' : 'pointer', 
                fontSize: '1rem', 
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <EnvelopeIcon width={20} height={20} />
              {emailing ? 'Sending...' : `Email to ${booking.passengerInfo.email}`}
            </button>

            <button
              onClick={printTicket}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: '#F59E0B', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <PrinterIcon width={20} height={20} />
              Print Ticket
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}