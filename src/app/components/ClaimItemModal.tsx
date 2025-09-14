"use client";
import { useState } from 'react';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface ClaimItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    _id: string;
    title: string;
    type: 'lost' | 'found';
    status: string;
    contactName: string;
    contactPhone?: string;
    contactEmail?: string;
    isPublic: boolean;
    verificationCode?: string;
    description: string;
  };
  onSuccess?: () => void;
}

export default function ClaimItemModal({ isOpen, onClose, item, onSuccess }: ClaimItemModalProps) {
  const [step, setStep] = useState<'verify' | 'contact' | 'success' | 'error'>('verify');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClaim = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/lost-found/${item._id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          verificationCode: item.type === 'found' ? verificationCode : undefined,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      } else {
        setError(data.message || 'Failed to claim item');
        setStep('error');
      }
    } catch (error) {
      console.error('Error claiming item:', error);
      setError('Failed to claim item. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = () => {
    // If contact details are public, show them
    if (item.isPublic) {
      setStep('contact');
    } else {
      // Otherwise, submit a contact request through the platform
      setMessage('Hi, I believe this item belongs to me. Could we arrange to meet?');
      handleClaim();
    }
  };

  const renderVerificationStep = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          item.type === 'lost' ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {item.type === 'lost' ? (
            <CheckCircleIcon className="w-8 h-8 text-red-600" />
          ) : (
            <KeyIcon className="w-8 h-8 text-green-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {item.type === 'lost' ? 'Claim Your Item' : 'Verify Item Details'}
        </h2>
        <p className="text-gray-600">
          {item.type === 'lost' 
            ? 'Is this your lost item? Let us help you get it back.'
            : 'To claim this item, please provide the verification details.'
          }
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-gray-600 text-sm">{item.description}</p>
      </div>

      {item.type === 'found' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code *
          </label>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the code provided when item was found"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This code was provided to you when the item was found
          </p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Information (Optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={
            item.type === 'lost' 
              ? 'Describe any additional details that prove this is your item...'
              : 'Describe how you found this item or any additional details...'
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        {item.isPublic ? (
          <button
            onClick={handleContactOwner}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Contact Owner
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={loading || (item.type === 'found' && !verificationCode)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Claim Item'}
          </button>
        )}
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
        <p className="text-gray-600">
          Here are the contact details for {item.contactName}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="font-medium text-gray-900">Contact Person:</span>
          <span className="text-gray-700">{item.contactName}</span>
        </div>

        {item.contactPhone && (
          <div className="flex items-center gap-3">
            <PhoneIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Phone:</span>
            <a
              href={`tel:${item.contactPhone}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {item.contactPhone}
            </a>
          </div>
        )}

        {item.contactEmail && (
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Email:</span>
            <a
              href={`mailto:${item.contactEmail}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {item.contactEmail}
            </a>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <strong>Safety Note:</strong> When meeting to exchange items, please meet in a public place and bring a friend if possible.
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('verify')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="p-6 text-center">
      <CheckCircleIcon className="mx-auto w-16 h-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h2>
      <p className="text-gray-600 mb-4">
        Your claim has been submitted successfully. The item owner will be notified and will contact you soon.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="text-sm text-green-700">
          <strong>What happens next?</strong>
          <ul className="mt-2 space-y-1 text-left">
            <li>• The item owner will receive your claim notification</li>
            <li>• They will review your information</li>
            <li>• You'll receive a response within 24-48 hours</li>
            <li>• If verified, you can arrange to meet and collect the item</li>
          </ul>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Redirecting to lost & found page...
      </p>
    </div>
  );

  const renderErrorStep = () => (
    <div className="p-6 text-center">
      <ExclamationTriangleIcon className="mx-auto w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Failed</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <div className="flex gap-3">
        <button
          onClick={() => setStep('verify')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.type === 'lost' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
            }`}>
              {item.type.toUpperCase()}
            </span>
            <span className="font-medium text-gray-900">{item.title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {step === 'verify' && renderVerificationStep()}
        {step === 'contact' && renderContactStep()}
        {step === 'success' && renderSuccessStep()}
        {step === 'error' && renderErrorStep()}
      </div>
    </div>
  );
}