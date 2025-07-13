// src/app/about/page.tsx
"use client";

import Link from 'next/link';
import { 
  MapIcon, 
  ClockIcon, 
  CreditCardIcon, 
  ChatBubbleLeftIcon,
  UserGroupIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "අනුර පෙරේරා",
      role: "Chief Executive Officer",
      description: "Transportation industry veteran with 15+ years experience",
      image: "👨‍💼"
    },
    {
      name: "Priya Wickramasinghe", 
      role: "Chief Technology Officer",
      description: "Expert in AI and transportation technology systems",
      image: "👩‍💻"
    },
    {
      name: "රාජ් ගුණවර්ධන",
      role: "Head of Operations",
      description: "Specialist in fleet management and route optimization",
      image: "👨‍🔧"
    },
    {
      name: "Sarah Fernando",
      role: "Customer Experience Director", 
      description: "Focused on creating exceptional user experiences",
      image: "👩‍💼"
    }
  ];

  const values = [
    {
      icon: HeartIcon,
      title: "Customer First",
      description: "We put our passengers at the heart of everything we do, ensuring safe, comfortable, and reliable transportation.",
      color: "#DC2626"
    },
    {
      icon: LightBulbIcon,
      title: "Innovation",
      description: "We embrace cutting-edge technology to revolutionize the transportation experience in Sri Lanka.",
      color: "#F59E0B"
    },
    {
      icon: ShieldCheckIcon,
      title: "Safety & Reliability",
      description: "Safety is our top priority. We maintain the highest standards in vehicle maintenance and driver training.",
      color: "#10B981"
    },
    {
      icon: GlobeAltIcon,
      title: "Sustainability", 
      description: "We're committed to reducing our environmental impact through efficient routing and eco-friendly practices.",
      color: "#3B82F6"
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Sri Express was founded with a vision to transform transportation in Sri Lanka"
    },
    {
      year: "2021", 
      title: "First Mobile App",
      description: "Launched our first mobile application for real-time bus tracking"
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Introduced AI-powered arrival predictions and route optimization"
    },
    {
      year: "2023",
      title: "Fleet Expansion",
      description: "Expanded to serve 50+ routes across major cities in Sri Lanka"
    },
    {
      year: "2024",
      title: "Smart Transport",
      description: "Launched comprehensive smart transportation management system"
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Continuing to innovate with electric vehicles and sustainable transport"
    }
  ];

  // Same animation styles as landing page
  const animationStyles = `
    @keyframes fade-in-down {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
      animation: fade-in-down 0.8s ease-out forwards;
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s ease-out forwards;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    /* Animation delay utilities */
    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-400 { animation-delay: 0.4s; }
    .animation-delay-500 { animation-delay: 0.5s; }
    .animation-delay-600 { animation-delay: 0.6s; }
    .animation-delay-700 { animation-delay: 0.7s; }
    .animation-delay-800 { animation-delay: 0.8s; }

    .card-hover:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      .section-padding {
        padding: 2rem 1rem !important;
      }
    }
  `;

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style jsx>{animationStyles}</style>
      
      {/* Same animated background as landing page */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
        zIndex: 1
      }}>
        {/* Simplified animated elements for performance */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          right: 0,
          height: '80px',
          backgroundColor: '#1f2937',
          opacity: 0.1,
          zIndex: 2
        }}></div>
        <div style={{
          position: 'absolute',
          top: '70%',
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: '#1f2937',
          opacity: 0.1,
          zIndex: 2
        }}></div>
      </div>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
        zIndex: 50,
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
            gap: '0.75rem',
            textDecoration: 'none'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#F59E0B'
            }}>
              ශ්‍රී
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1F2937'
            }}>
              Express
            </div>
          </Link>
          
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <Link href="#" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: '500' }}>About</Link>
            <Link href="/services" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Services</Link>
            <Link href="/contact" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Contact</Link>
            <Link
              href="/login"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="animate-fade-in-down">
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
              lineHeight: '1.1'
            }}>
              About <span style={{ 
                color: '#fcd34d',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)'
              }}>ශ්‍රී</span> Express
            </h1>
          </div>
          
          <div className="animate-fade-in-up animation-delay-300">
            <p style={{
              fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
              color: '#1F2937',
              marginBottom: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '800px'
            }}>
              Transforming transportation in Sri Lanka through innovation, technology, and exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{
        padding: '4rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div className="animate-fade-in-up">
              <h2 style={{
                fontSize: 'clamp(2rem, 6vw, 3rem)',
                fontWeight: 'bold',
                color: '#1F2937',
                marginBottom: '2rem'
              }}>
                Our Mission
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: '#4B5563',
                lineHeight: '1.8',
                marginBottom: '2rem'
              }}>
                To revolutionize public transportation in Sri Lanka by providing safe, reliable, and technologically advanced transport solutions that connect communities and enhance the quality of life for all passengers.
              </p>
              <p style={{
                fontSize: '1.1rem',
                color: '#6B7280',
                lineHeight: '1.7'
              }}>
                We believe transportation should be more than just getting from point A to point B. It should be an experience that is comfortable, predictable, and accessible to everyone.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-300" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '3rem',
              borderRadius: '1rem',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#F59E0B'
                  }}>50+</div>
                  <div style={{ color: '#6B7280' }}>Routes Served</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#DC2626'
                  }}>100K+</div>
                  <div style={{ color: '#6B7280' }}>Happy Passengers</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#10B981'
                  }}>99.5%</div>
                  <div style={{ color: '#6B7280' }}>On-Time Rate</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#3B82F6'
                  }}>24/7</div>
                  <div style={{ color: '#6B7280' }}>Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: '4rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)'
            }}>
              Our Values
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#1F2937',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              The principles that guide everything we do
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {values.map((value, index) => (
              <div
                key={index}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100} card-hover`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: value.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: `0 10px 20px ${value.color}40`
                }}>
                  <value.icon width={40} height={40} color="white" />
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '1rem'
                }}>
                  {value.title}
                </h3>
                <p style={{
                  color: '#6B7280',
                  lineHeight: '1.6'
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{
        padding: '4rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Meet Our Team
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              The passionate individuals driving innovation in Sri Lankan transportation
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100} card-hover`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1rem'
                }}>
                  {member.image}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  {member.name}
                </h3>
                <div style={{
                  color: '#F59E0B',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  {member.role}
                </div>
                <p style={{
                  color: '#6B7280',
                  lineHeight: '1.6'
                }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={{
        padding: '4rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.7)'
            }}>
              Our Journey
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#1F2937',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              Key milestones in our mission to transform transportation
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100} card-hover`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '2rem',
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {milestone.year}
                </div>
                <div style={{ paddingTop: '1rem' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '1rem'
                  }}>
                    {milestone.title}
                  </h3>
                  <p style={{
                    color: '#6B7280',
                    lineHeight: '1.6'
                  }}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: '2rem'
          }}>
            Ready to Experience the Future of Transportation?
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#6B7280',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Join thousands of satisfied passengers who trust Sri Express for their daily transportation needs.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              href="/register"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '1.1rem',
                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(245, 158, 11, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(245, 158, 11, 0.5)';
              }}
            >
              Get Started Today
              <ArrowRightIcon width={20} height={20} />
            </Link>
            <Link
              href="/services"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1F2937',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '2px solid #F59E0B',
                transition: 'all 0.3s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F59E0B';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.color = '#1F2937';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        color: 'white',
        padding: '3rem 1.5rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#F59E0B',
              marginRight: '0.5rem'
            }}>
              ශ්‍රී
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              Express
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '1.5rem',
            color: '#9CA3AF'
          }}>
            <p>&copy; 2025 Sri Express. All rights reserved. | Transforming transportation in Sri Lanka</p>
          </div>
        </div>
      </footer>
    </div>
  );
}