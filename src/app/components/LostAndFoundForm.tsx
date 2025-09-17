"use client";
import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PhotoIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface LostAndFoundFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  type: 'lost' | 'found';
  locationFound: string;
  locationLost: string;
  routeId: string;
  vehicleId: string;
  stopName: string;
  dateLostOrFound: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  isPublic: boolean;
  additionalInfo: string;
  reward: string;
}

const categoryOptions = [
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'personal', label: 'Personal Items', icon: '👜' },
  { value: 'documents', label: 'Documents', icon: '📄' },
  { value: 'clothing', label: 'Clothing', icon: '👕' },
  { value: 'accessories', label: 'Accessories', icon: '👓' },
  { value: 'bags', label: 'Bags', icon: '🎒' },
  { value: 'books', label: 'Books', icon: '📚' },
  { value: 'keys', label: 'Keys', icon: '🔑' },
  { value: 'other', label: 'Other', icon: '📦' }
];

export default function LostAndFoundForm({ isOpen, onClose, onSuccess }: LostAndFoundFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'other',
    brand: '',
    color: '',
    size: '',
    type: 'lost',
    locationFound: '',
    locationLost: '',
    routeId: '',
    vehicleId: '',
    stopName: '',
    dateLostOrFound: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    isPublic: true,
    additionalInfo: '',
    reward: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      // TEMPORARY: Skip auth check for testing
      setIsAuthenticated(true); // Change back to !!token later
      
      fetchRoutes();
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dateLostOrFound: today }));
    }
  }, [isOpen]);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/routes');
      const data = await response.json();
      if (data.success) {
        setRoutes(data.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + images.length > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      setImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.contactName || !formData.dateLostOrFound) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create form data for submission
      const submitData = {
        ...formData,
        reward: formData.reward ? parseFloat(formData.reward) : undefined,
        images: [], // Will be implemented with image upload service
      };

      // Set location based on type
      if (formData.type === 'lost') {
        submitData.locationLost = formData.locationLost;
        submitData.locationFound = '';
      } else {
        submitData.locationFound = formData.locationFound;
        submitData.locationLost = '';
      }

      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/lost-found', {
        method: 'POST',
        headers,
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 2000);
      } else {
        if (response.status === 401) {
          setError('Please log in to report lost/found items');
          setIsAuthenticated(false);
        } else {
          setError(data.message || 'Failed to submit report');
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        setError('Please log in to report lost/found items');
        setIsAuthenticated(false);
      } else if (error.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please check if the backend is running.');
      } else {
        setError('Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      brand: '',
      color: '',
      size: '',
      type: 'lost',
      locationFound: '',
      locationLost: '',
      routeId: '',
      vehicleId: '',
      stopName: '',
      dateLostOrFound: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      isPublic: true,
      additionalInfo: '',
      reward: ''
    });
    setImages([]);
    setError('');
    setSuccess(false);
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to report lost or found items. This helps us verify reports and contact you about your items.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your {formData.type} item report has been submitted successfully. 
            We'll help reunite you with your item.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to the lost & found page...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        color: 'black'
      }}>
        <div style={{ 
          padding: '24px',
          color: 'black'
        }}>
          <style jsx>{`
            label { color: black !important; font-weight: 600 !important; }
            input { color: black !important; background: white !important; }
            select { color: black !important; background: white !important; }
            textarea { color: black !important; background: white !important; }
            .text-gray-700 { color: black !important; }
            .text-gray-600 { color: #666666 !important; }
            .text-gray-500 { color: #888888 !important; }
            .text-gray-900 { color: black !important; }
            .bg-gray-50 { background-color: #f8f9fa !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
          `}</style>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', margin: '0 0 8px 0' }}>
                Report Lost/Found Item
              </h2>
              <p style={{ color: '#666666', margin: '0', fontSize: '16px' }}>
                Help us reunite lost items with their owners
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                color: '#666666',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <XMarkIcon style={{ width: '24px', height: '24px' }} />
            </button>
          </div>

          {/* Progress Steps */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {[1, 2, 3].map((step) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: step <= currentStep ? '#2563eb' : '#e5e7eb',
                    color: step <= currentStep ? 'white' : '#6b7280'
                  }}>
                    {step}
                  </div>
                  <div style={{
                    marginLeft: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: step <= currentStep ? '#2563eb' : '#6b7280'
                  }}>
                    {step === 1 && 'Item Details'}
                    {step === 2 && 'Location & Date'}
                    {step === 3 && 'Contact Info'}
                  </div>
                  {step < 3 && (
                    <div style={{
                      flex: 1,
                      height: '4px',
                      margin: '0 16px',
                      backgroundColor: step < currentStep ? '#2563eb' : '#e5e7eb'
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ExclamationTriangleIcon style={{ width: '20px', height: '20px', color: '#dc2626' }} />
              <span style={{ color: '#b91c1c', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Item Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'black',
                    marginBottom: '12px'
                  }}>
                    What happened? *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.type === 'lost'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value="lost"
                        checked={formData.type === 'lost'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-2xl mb-2">😔</div>
                      <div className="font-medium">I Lost Something</div>
                      <div className="text-sm text-gray-500">Report a lost item</div>
                    </label>

                    <label className={`cursor-pointer p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.type === 'found'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value="found"
                        checked={formData.type === 'found'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="font-medium">I Found Something</div>
                      <div className="text-sm text-gray-500">Report a found item</div>
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., iPhone 13 Pro, Black Backpack, Car Keys"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Apple, Samsung"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g., Black, Red"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g., Large, Medium"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Provide a detailed description including any unique features, scratches, stickers, or other identifying marks..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-800">Upload photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-gray-500 text-sm mt-1">
                        PNG, JPG up to 5MB each (max 5 photos)
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Location & Date */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When was it {formData.type}? *
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dateLostOrFound"
                      value={formData.dateLostOrFound}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where was it {formData.type}? *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name={formData.type === 'lost' ? 'locationLost' : 'locationFound'}
                      value={formData.type === 'lost' ? formData.locationLost : formData.locationFound}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g., Pettah Bus Stand, Platform 2, Near the ticket counter"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Route (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Route (Optional)
                  </label>
                  <select
                    name="routeId"
                    value={formData.routeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select route (if applicable)</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.name} - {route.startLocation} to {route.endLocation}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleInputChange}
                      placeholder="e.g., NC-1234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stop Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="stopName"
                      value={formData.stopName}
                      onChange={handleInputChange}
                      placeholder="e.g., Pettah Central"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any other details that might help..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Reward (for lost items) */}
                {formData.type === 'lost' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward Amount (Optional)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="reward"
                        value={formData.reward}
                        onChange={handleInputChange}
                        placeholder="Amount in LKR"
                        min="0"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Offering a reward may increase the chances of recovery
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <strong>Privacy Note:</strong> Your contact information will only be shared with verified users who claim to have found your item or own the item you found.
                  </div>
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional but recommended)
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Make my contact information visible to other users
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    When unchecked, contact will be facilitated through our platform
                  </p>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      required
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <a href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and confirm that the information provided is accurate to the best of my knowledge.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : prevStep}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>

              <div className="flex gap-3">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}