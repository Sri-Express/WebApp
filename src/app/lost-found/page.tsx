"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import LostAndFoundForm from '../components/LostAndFoundForm';
import ClaimItemModal from '../components/ClaimItemModal';

interface LostAndFoundItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  size?: string;
  type: 'lost' | 'found';
  status: string;
  locationFound?: string;
  locationLost?: string;
  dateReported: string;
  dateLostOrFound: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  images?: string[];
  reward?: number;
  isPublic: boolean;
  viewCount: number;
  reportedBy: {
    name: string;
  };
  routeId?: {
    name: string;
    startLocation: string;
    endLocation: string;
  };
  daysSinceReported: number;
  daysUntilExpiry: number;
}

const categoryIcons: { [key: string]: string } = {
  electronics: '📱',
  personal: '👜',
  documents: '📄',
  clothing: '👕',
  accessories: '👓',
  bags: '🎒',
  books: '📚',
  keys: '🔑',
  other: '📦'
};

const categoryLabels: { [key: string]: string } = {
  electronics: 'Electronics',
  personal: 'Personal Items',
  documents: 'Documents',
  clothing: 'Clothing',
  accessories: 'Accessories',
  bags: 'Bags',
  books: 'Books',
  keys: 'Keys',
  other: 'Other'
};

export default function LostAndFoundPage() {
  const { theme } = useTheme();
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostAndFoundItem | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [itemToClaim, setItemToClaim] = useState<LostAndFoundItem | null>(null);

  // Theme Styles
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    navBg: 'rgba(30, 41, 59, 0.92)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)',
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)',
    alertBg: 'rgba(249, 250, 251, 0.6)'
  };
  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#9ca3af',
    navBg: 'rgba(30, 41, 59, 0.92)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)',
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)',
    alertBg: 'rgba(51, 65, 85, 0.6)'
  };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedCategory, searchTerm]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:5000/api/lost-found?${params}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      } else {
        setError(data.message || 'Failed to fetch items');
      }
    } catch (error: any) {
      console.error('Error fetching items:', error);
      if (error.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please ensure the backend is running on port 5000.');
      } else {
        setError('Failed to fetch items');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { color: '#059669', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'matched': return { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' };
      case 'claimed': return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
      case 'expired': return { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' };
      default: return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'lost' 
      ? { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' }
      : { color: '#059669', bg: 'rgba(16, 185, 129, 0.1)' };
  };

  const handleClaimItem = (item: LostAndFoundItem) => {
    setItemToClaim(item);
    setShowClaimModal(true);
    setSelectedItem(null);
  };

  return (
    <div style={{ 
      backgroundColor: currentThemeStyles.mainBg, 
      minHeight: '100vh', 
      position: 'relative', 
      overflowX: 'hidden' 
    }}>
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        @media (max-width: 768px) { 
          .animated-vehicle { display: none; }
          .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
      
      {/* Animated Background */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Navigation */}
      <nav style={{ 
        backgroundColor: currentThemeStyles.navBg, 
        backdropFilter: 'blur(12px)', 
        borderBottom: currentThemeStyles.navBorder, 
        padding: '1rem 0', 
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            textDecoration: 'none' 
          }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#ffffff', 
                margin: 0, 
                textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
              }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Lost & Found Portal</p>
            </div>
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <Link href="/dashboard" style={{ 
              color: currentThemeStyles.textSecondary, 
              textDecoration: 'none', 
              fontWeight: '500', 
              fontSize: '0.875rem',
              color: '#94a3b8'
            }}>Dashboard</Link>
            <button
              onClick={() => setShowReportForm(true)}
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <PlusIcon style={{ width: '16px', height: '16px' }} />
              Report Item
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10 
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: currentThemeStyles.glassPanelBg,
          backdropFilter: 'blur(12px)',
          border: currentThemeStyles.glassPanelBorder,
          borderRadius: '1rem',
          boxShadow: currentThemeStyles.glassPanelShadow,
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }} className="animate-fade-in-up">
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: currentThemeStyles.textPrimary, 
            margin: '0 0 0.5rem 0' 
          }}>Lost & Found</h1>
          <p style={{ 
            color: currentThemeStyles.textSecondary, 
            margin: 0, 
            fontSize: '1.1rem' 
          }}>Help reunite lost items with their owners</p>
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: currentThemeStyles.glassPanelBg,
          borderRadius: '1rem',
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)',
          border: currentThemeStyles.glassPanelBorder,
          padding: '2rem',
          marginBottom: '2rem'
        }} className="animate-fade-in-up">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Top Row - Search and Type Filter */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: '1', minWidth: '300px' }}>
                <div style={{ position: 'relative' }}>
                  <MagnifyingGlassIcon style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: currentThemeStyles.textMuted, 
                    width: '20px', 
                    height: '20px' 
                  }} />
                  <input
                    type="text"
                    placeholder="Search by description, brand, color..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      border: currentThemeStyles.quickActionBorder,
                      borderRadius: '0.75rem',
                      backgroundColor: currentThemeStyles.alertBg,
                      color: currentThemeStyles.textPrimary,
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: currentThemeStyles.alertBg, 
                borderRadius: '0.75rem', 
                padding: '0.25rem',
                border: currentThemeStyles.quickActionBorder
              }}>
                {[
                  { value: 'all', label: 'All Items' },
                  { value: 'lost', label: 'Lost' },
                  { value: 'found', label: 'Found' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: selectedType === type.value ? '#F59E0B' : 'transparent',
                      color: selectedType === type.value ? 'white' : currentThemeStyles.textPrimary
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row - Category and Filter Toggle */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: currentThemeStyles.quickActionBorder,
                  borderRadius: '0.75rem',
                  backgroundColor: currentThemeStyles.alertBg,
                  color: currentThemeStyles.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {categoryIcons[value]} {label}
                  </option>
                ))}
              </select>

              {/* Results Count */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                color: currentThemeStyles.textSecondary,
                fontSize: '0.875rem'
              }}>
                <span>
                  {loading ? 'Loading...' : `${items.length} items found`}
                </span>
                <span style={{ color: currentThemeStyles.textMuted }}>
                  🔄 Auto-refreshes every 30 seconds
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem' 
          }} className="grid-responsive">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ 
                backgroundColor: currentThemeStyles.glassPanelBg, 
                borderRadius: '1rem', 
                padding: '2rem',
                border: currentThemeStyles.glassPanelBorder,
                backdropFilter: 'blur(12px)',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{ height: '1rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem', marginBottom: '1rem' }}></div>
                <div style={{ height: '0.75rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem', marginBottom: '2rem', width: '60%' }}></div>
                <div style={{ height: '5rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem', marginBottom: '1rem' }}></div>
                <div style={{ height: '0.75rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem', marginBottom: '0.5rem' }}></div>
                <div style={{ height: '0.75rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.5rem', width: '80%' }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: currentThemeStyles.glassPanelBg,
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)'
          }}>
            <ExclamationTriangleIcon style={{ 
              margin: '0 auto 1rem auto', 
              height: '3rem', 
              width: '3rem', 
              color: '#dc2626' 
            }} />
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: currentThemeStyles.textPrimary 
            }}>Error loading items</h3>
            <p style={{ 
              margin: '0 0 1rem 0', 
              color: currentThemeStyles.textSecondary 
            }}>{error}</p>
            <button
              onClick={fetchItems}
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: currentThemeStyles.glassPanelBg,
            borderRadius: '1rem',
            border: currentThemeStyles.glassPanelBorder,
            backdropFilter: 'blur(12px)'
          }}>
            <MagnifyingGlassIcon style={{ 
              margin: '0 auto 1rem auto', 
              height: '3rem', 
              width: '3rem', 
              color: currentThemeStyles.textMuted 
            }} />
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: currentThemeStyles.textPrimary 
            }}>No items found</h3>
            <p style={{ 
              margin: '0 0 1rem 0', 
              color: currentThemeStyles.textSecondary 
            }}>
              Try adjusting your search criteria or be the first to report an item.
            </p>
            <button
              onClick={() => setShowReportForm(true)}
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Report Lost/Found Item
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem' 
          }} className="grid-responsive">
            {items.map((item) => {
              const statusColor = getStatusColor(item.status);
              const typeColor = getTypeColor(item.type);
              
              return (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: currentThemeStyles.glassPanelBg,
                    borderRadius: '1rem',
                    boxShadow: currentThemeStyles.glassPanelShadow,
                    backdropFilter: 'blur(12px)',
                    border: currentThemeStyles.glassPanelBorder,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    ':hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.35)'
                    }
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Item Image */}
                  {item.images && item.images.length > 0 ? (
                    <div style={{ 
                      aspectRatio: '16/9', 
                      borderRadius: '1rem 1rem 0 0', 
                      overflow: 'hidden' 
                    }}>
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        style={{ 
                          width: '100%', 
                          height: '12rem', 
                          objectFit: 'cover' 
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      height: '12rem', 
                      backgroundColor: currentThemeStyles.alertBg, 
                      borderRadius: '1rem 1rem 0 0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <div style={{ fontSize: '4rem' }}>{categoryIcons[item.category]}</div>
                    </div>
                  )}

                  <div style={{ padding: '1.5rem' }}>
                    {/* Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: '1rem' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: typeColor.color,
                          backgroundColor: typeColor.bg
                        }}>
                          {item.type.toUpperCase()}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: statusColor.color,
                          backgroundColor: statusColor.bg
                        }}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      {item.reward && (
                        <div style={{ 
                          color: '#059669', 
                          fontWeight: 'bold', 
                          fontSize: '0.875rem' 
                        }}>
                          Rs. {item.reward.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ 
                      fontWeight: '600', 
                      color: currentThemeStyles.textPrimary, 
                      marginBottom: '0.5rem',
                      fontSize: '1.125rem',
                      lineHeight: '1.2'
                    }}>
                      {item.title}
                    </h3>

                    {/* Category and Details */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.75rem',
                      fontSize: '0.875rem',
                      color: currentThemeStyles.textSecondary
                    }}>
                      <TagIcon style={{ width: '16px', height: '16px' }} />
                      <span>{categoryIcons[item.category]} {categoryLabels[item.category]}</span>
                      {item.brand && <span>• {item.brand}</span>}
                      {item.color && <span>• {item.color}</span>}
                    </div>

                    {/* Description */}
                    <p style={{ 
                      color: currentThemeStyles.textSecondary, 
                      fontSize: '0.875rem', 
                      marginBottom: '1rem',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.description}
                    </p>

                    {/* Location */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.75rem',
                      fontSize: '0.875rem',
                      color: currentThemeStyles.textSecondary
                    }}>
                      <MapPinIcon style={{ width: '16px', height: '16px' }} />
                      <span style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.type === 'lost' ? item.locationLost : item.locationFound}
                        {item.routeId && ` (${item.routeId.name})`}
                      </span>
                    </div>

                    {/* Date */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      color: currentThemeStyles.textSecondary
                    }}>
                      <CalendarDaysIcon style={{ width: '16px', height: '16px' }} />
                      <span>
                        {item.type === 'lost' ? 'Lost' : 'Found'} on {formatDate(item.dateLostOrFound)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      paddingTop: '1rem', 
                      borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        fontSize: '0.75rem',
                        color: currentThemeStyles.textMuted
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <EyeIcon style={{ width: '14px', height: '14px' }} />
                          <span>{item.viewCount} views</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ClockIcon style={{ width: '14px', height: '14px' }} />
                          <span>{item.daysSinceReported}d ago</span>
                        </div>
                      </div>
                      <button style={{
                        color: '#F59E0B',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1rem', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: currentThemeStyles.glassPanelBg, 
            borderRadius: '1rem', 
            maxWidth: '2xl', 
            width: '100%', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            backdropFilter: 'blur(12px)',
            border: currentThemeStyles.glassPanelBorder
          }}>
            <div style={{ padding: '2rem' }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '1.5rem' 
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      ...getTypeColor(selectedItem.type)
                    }}>
                      {selectedItem.type.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      ...getStatusColor(selectedItem.status)
                    }}>
                      {selectedItem.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: currentThemeStyles.textPrimary,
                    margin: 0
                  }}>
                    {selectedItem.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    color: currentThemeStyles.textMuted,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <XMarkIcon style={{ width: '24px', height: '24px' }} />
                </button>
              </div>

              {/* Images */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {selectedItem.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedItem.title} ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '12rem', 
                          objectFit: 'cover', 
                          borderRadius: '0.75rem' 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2rem', 
                marginBottom: '2rem' 
              }}>
                <div>
                  <h3 style={{ 
                    fontWeight: '600', 
                    color: currentThemeStyles.textPrimary, 
                    marginBottom: '1rem' 
                  }}>Item Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: currentThemeStyles.textSecondary }}>Category:</span>
                      <span style={{ color: currentThemeStyles.textPrimary }}>
                        {categoryIcons[selectedItem.category]} {categoryLabels[selectedItem.category]}
                      </span>
                    </div>
                    {selectedItem.brand && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Brand:</span>
                        <span style={{ color: currentThemeStyles.textPrimary }}>{selectedItem.brand}</span>
                      </div>
                    )}
                    {selectedItem.color && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Color:</span>
                        <span style={{ color: currentThemeStyles.textPrimary }}>{selectedItem.color}</span>
                      </div>
                    )}
                    {selectedItem.size && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Size:</span>
                        <span style={{ color: currentThemeStyles.textPrimary }}>{selectedItem.size}</span>
                      </div>
                    )}
                    {selectedItem.reward && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Reward:</span>
                        <span style={{ color: '#059669', fontWeight: 'bold' }}>
                          Rs. {selectedItem.reward.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ 
                    fontWeight: '600', 
                    color: currentThemeStyles.textPrimary, 
                    marginBottom: '1rem' 
                  }}>Location & Date</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: currentThemeStyles.textSecondary }}>
                        {selectedItem.type === 'lost' ? 'Lost at:' : 'Found at:'}
                      </span>
                      <span style={{ color: currentThemeStyles.textPrimary }}>
                        {selectedItem.type === 'lost' ? selectedItem.locationLost : selectedItem.locationFound}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: currentThemeStyles.textSecondary }}>Date:</span>
                      <span style={{ color: currentThemeStyles.textPrimary }}>
                        {formatDate(selectedItem.dateLostOrFound)}
                      </span>
                    </div>
                    {selectedItem.routeId && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: currentThemeStyles.textSecondary }}>Route:</span>
                        <span style={{ color: currentThemeStyles.textPrimary }}>{selectedItem.routeId.name}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: currentThemeStyles.textSecondary }}>Reported:</span>
                      <span style={{ color: currentThemeStyles.textPrimary }}>
                        {formatDate(selectedItem.dateReported)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: currentThemeStyles.textPrimary, 
                  marginBottom: '1rem' 
                }}>Description</h3>
                <p style={{ 
                  color: currentThemeStyles.textSecondary,
                  lineHeight: '1.6'
                }}>{selectedItem.description}</p>
              </div>

              {/* Contact Information */}
              {selectedItem.isPublic && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ 
                    fontWeight: '600', 
                    color: currentThemeStyles.textPrimary, 
                    marginBottom: '1rem' 
                  }}>Contact Information</h3>
                  <div style={{ 
                    backgroundColor: currentThemeStyles.alertBg, 
                    borderRadius: '0.75rem', 
                    padding: '1.5rem' 
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: currentThemeStyles.textPrimary }}>Contact Person:</span>
                        <span style={{ color: currentThemeStyles.textSecondary }}>{selectedItem.contactName}</span>
                      </div>
                      {selectedItem.contactPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <PhoneIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textSecondary }} />
                          <a
                            href={`tel:${selectedItem.contactPhone}`}
                            style={{ color: '#F59E0B', textDecoration: 'none' }}
                          >
                            {selectedItem.contactPhone}
                          </a>
                        </div>
                      )}
                      {selectedItem.contactEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <EnvelopeIcon style={{ width: '16px', height: '16px', color: currentThemeStyles.textSecondary }} />
                          <a
                            href={`mailto:${selectedItem.contactEmail}`}
                            style={{ color: '#F59E0B', textDecoration: 'none' }}
                          >
                            {selectedItem.contactEmail}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {selectedItem.status === 'active' && (
                  <button 
                    onClick={() => handleClaimItem(selectedItem)}
                    style={{
                      flex: 1,
                      backgroundColor: '#F59E0B',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
                    {selectedItem.type === 'lost' ? 'This is mine' : 'I found this'}
                  </button>
                )}
                <button style={{
                  flex: 1,
                  backgroundColor: currentThemeStyles.alertBg,
                  color: currentThemeStyles.textPrimary,
                  padding: '0.75rem 1rem',
                  border: currentThemeStyles.quickActionBorder,
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      <LostAndFoundForm
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSuccess={() => {
          fetchItems(); // Refresh the items list
        }}
      />

      {/* Claim Item Modal */}
      {itemToClaim && (
        <ClaimItemModal
          isOpen={showClaimModal}
          onClose={() => {
            setShowClaimModal(false);
            setItemToClaim(null);
          }}
          item={itemToClaim}
          onSuccess={() => {
            fetchItems(); // Refresh the items list
          }}
        />
      )}
    </div>
  );
}