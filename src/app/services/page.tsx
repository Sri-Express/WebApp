// src/app/services/page.tsx
"use client";

import Link from 'next/link';
import { 
  MapIcon, 
  UserGroupIcon,
  TruckIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  WifiIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function ServicesPage() {
  const mainServices = [
    {
      icon: TruckIcon,
      title: "Public Transportation",
      description: "Comprehensive city-wide bus and train services with real-time tracking.",
      features: [
        "Real-time GPS tracking",
        "Digital payment integration", 
        "Route optimization",
        "Accessibility features",
        "Weather integration",
        "Emergency support"
      ],
      color: "#F59E0B",
      bgGradient: "linear-gradient(135deg, #FEF3C7, #FDE68A)"
    },
    {
      icon: AcademicCapIcon,
      title: "School Transportation",
      description: "Safe and reliable transportation solutions for educational institutions.",
      features: [
        "Student safety tracking",
        "Parent notifications",
        "Route monitoring",
        "Attendance tracking",
        "Emergency protocols",
        "Driver verification"
      ],
      color: "#10B981",
      bgGradient: "linear-gradient(135deg, #D1FAE5, #A7F3D0)"
    },
    {
      icon: BuildingOfficeIcon,
      title: "Corporate Transport",
      description: "Professional transportation services for businesses and organizations.",
      features: [
        "Employee transport",
        "Executive services",
        "Event transportation",
        "Cost management",
        "Fleet analytics",
        "Dedicated support"
      ],
      color: "#3B82F6",
      bgGradient: "linear-gradient(135deg, #DBEAFE, #BFDBFE)"
    },
    {
      icon: UserGroupIcon,
      title: "Private Fleet Management",
      description: "Complete fleet management solutions for transport companies.",
      features: [
        "Vehicle tracking",
        "Driver management",
        "Maintenance scheduling",
        "Revenue analytics",
        "Route planning",
        "Compliance monitoring"
      ],
      color: "#8B5CF6",
      bgGradient: "linear-gradient(135deg, #EDE9FE, #DDD6FE)"
    }
  ];

  const additionalServices = [
    {
      icon: DevicePhoneMobileIcon,
      title: "Mobile Applications",
      description: "User-friendly mobile apps for passengers and operators",
      color: "#EC4899"
    },
    {
      icon: MapIcon,
      title: "Route Planning",
      description: "AI-powered route optimization and traffic management",
      color: "#F59E0B"
    },
    {
      icon: WifiIcon,
      title: "Real-time Updates",
      description: "Live tracking and instant notifications",
      color: "#10B981"
    },
    {
      icon: ShieldCheckIcon,
      title: "Safety Systems",
      description: "Comprehensive safety and emergency protocols",
      color: "#DC2626"
    },
    {
      icon: CurrencyDollarIcon,
      title: "Payment Solutions",
      description: "Secure digital payment and ticketing systems",
      color: "#3B82F6"
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Analytics & Reporting",
      description: "Detailed insights and performance analytics",
      color: "#8B5CF6"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      period: "Forever",
      description: "Perfect for individual passengers",
      features: [
        "Real-time bus tracking",
        "Route information",
        "Basic notifications",
        "Mobile app access",
        "Customer support"
      ],
      color: "#10B981",
      popular: false
    },
    {
      name: "Premium",
      price: "₨ 500",
      period: "Per Month",
      description: "Enhanced features for frequent travelers",
      features: [
        "All Basic features",
        "Priority booking",
        "Advanced notifications",
        "Trip history & analytics",
        "24/7 premium support",
        "Exclusive discounts"
      ],
      color: "#F59E0B",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Contact Us",
      description: "Comprehensive solutions for organizations",
      features: [
        "All Premium features",
        "Fleet management dashboard",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "White-label solutions"
      ],
      color: "#3B82F6",
      popular: false
    }
  ];

  // Same animation styles as other pages
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
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .pricing-card:hover {
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
      
      {/* Same animated background as other pages */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
        zIndex: 1
      }}>
        {/* Simplified animated elements */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: '#1f2937',
          opacity: 0.1,
          zIndex: 2
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: 0,
          right: 0,
          height: '80px',
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
            <Link href="/about" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>About</Link>
            <Link href="#" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: '500' }}>Services</Link>
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
              Our <span style={{ 
                color: '#fcd34d',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)'
              }}>Services</span>
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
              Comprehensive transportation solutions designed for every need in Sri Lanka.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
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
              Transportation Solutions
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              From public transport to private fleet management, we&apos;ve got you covered
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {mainServices.map((service, index) => (
              <div
                key={index}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100} card-hover`}
                style={{
                  background: service.bgGradient,
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '100px',
                  height: '100px',
                  background: service.color,
                  borderRadius: '50%',
                  opacity: 0.1
                }}></div>
                
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: service.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  boxShadow: `0 10px 20px ${service.color}40`
                }}>
                  <service.icon width={40} height={40} color="white" />
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '1rem'
                }}>
                  {service.title}
                </h3>
                
                <p style={{
                  color: '#4B5563',
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  {service.description}
                </p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                      color: '#374151'
                    }}>
                      <CheckCircleIcon width={16} height={16} color={service.color} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Link
                    href="/register"
                    style={{
                      backgroundColor: service.color,
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 15px ${service.color}40`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Get Started
                    <ArrowRightIcon width={16} height={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
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
              Additional Features
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
              Enhanced features that make your transportation experience seamless
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {additionalServices.map((service, index) => (
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
                  width: '60px',
                  height: '60px',
                  backgroundColor: service.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: `0 8px 16px ${service.color}40`
                }}>
                  <service.icon width={30} height={30} color="white" />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '0.75rem'
                }}>
                  {service.title}
                </h3>
                <p style={{
                  color: '#6B7280',
                  lineHeight: '1.6'
                }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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
              Choose Your Plan
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#6B7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Flexible pricing options to suit individuals, families, and organizations
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100} pricing-card`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: plan.popular ? `0 15px 35px ${plan.color}40` : '0 10px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  border: plan.popular ? `2px solid ${plan.color}` : '1px solid rgba(251, 191, 36, 0.2)',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: plan.color,
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    Most Popular
                  </div>
                )}
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '0.5rem'
                }}>
                  {plan.name}
                </h3>
                
                <div style={{
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: plan.color
                  }}>
                    {plan.price}
                  </span>
                  <span style={{
                    color: '#6B7280',
                    marginLeft: '0.5rem'
                  }}>
                    {plan.period}
                  </span>
                </div>
                
                <p style={{
                  color: '#6B7280',
                  marginBottom: '2rem'
                }}>
                  {plan.description}
                </p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 2rem 0',
                  textAlign: 'left'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      color: '#374151'
                    }}>
                      <CheckCircleIcon width={16} height={16} color={plan.color} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={plan.name === 'Enterprise' ? '/contact' : '/register'}
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: plan.popular ? plan.color : 'transparent',
                    color: plan.popular ? 'white' : plan.color,
                    border: `2px solid ${plan.color}`,
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
                  onMouseOver={(e) => {
                    if (!plan.popular) {
                      e.currentTarget.style.backgroundColor = plan.color;
                      e.currentTarget.style.color = 'white';
                    }
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    if (!plan.popular) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = plan.color;
                    }
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '3rem',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '2rem'
            }}>
              Ready to Transform Your Transportation Experience?
            </h2>
            
            <p style={{
              fontSize: '1.2rem',
              color: '#6B7280',
              marginBottom: '3rem',
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}>
              Join thousands of satisfied customers who trust Sri Express for reliable, safe, and efficient transportation services.
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
                Start Your Journey
                <ArrowRightIcon width={20} height={20} />
              </Link>
              <Link
                href="/contact"
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
                Contact Sales
                <PhoneIcon width={20} height={20} />
              </Link>
            </div>
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
            <p>© 2025 Sri Express. All rights reserved. | Transforming transportation in Sri Lanka</p>
          </div>
        </div>
      </footer>
    </div>
  );
}