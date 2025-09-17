"use client";
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestModal({ isOpen, onClose }: TestModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      console.log('Modal element created:', modalRef.current);
      const styles = getComputedStyle(modalRef.current);
      console.log('Modal element styles:', styles);
      console.log('Position:', styles.position);
      console.log('Z-index:', styles.zIndex);
      console.log('Display:', styles.display);
      console.log('Visibility:', styles.visibility);
      console.log('Opacity:', styles.opacity);
      console.log('Top:', styles.top);
      console.log('Left:', styles.left);
      console.log('Width:', styles.width);
      console.log('Height:', styles.height);
      
      // Force visibility
      modalRef.current.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(255, 0, 0, 0.95) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-size: 24px !important;
        font-weight: bold !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      `;
      
      console.log('Force applied styles to modal');
      
      // Also check document.body styles
      const bodyStyles = getComputedStyle(document.body);
      console.log('Body overflow:', bodyStyles.overflow);
      console.log('Body position:', bodyStyles.position);
      console.log('Body z-index:', bodyStyles.zIndex);
      
      // Check if there are any elements with higher z-index
      const allElements = document.querySelectorAll('*');
      let highestZIndex = 0;
      let elementsWithHighZ = [];
      
      allElements.forEach(el => {
        const zIndex = parseInt(getComputedStyle(el).zIndex);
        if (zIndex > 1000) {
          elementsWithHighZ.push({ element: el, zIndex });
          if (zIndex > highestZIndex) highestZIndex = zIndex;
        }
      });
      
      console.log('Highest z-index on page:', highestZIndex);
      console.log('Elements with high z-index:', elementsWithHighZ);
    }
  }, [isOpen]);
  console.log('TestModal rendered with isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('TestModal: not open, returning null');
    return null;
  }

  console.log('TestModal: rendering modal');
  
  const modalContent = (
    <div 
      ref={modalRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 0, 0, 0.9)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}
      onClick={onClose}
    >
      <div style={{ background: 'white', color: 'black', padding: '20px', borderRadius: '8px' }}>
        <h2>TEST MODAL WORKING!</h2>
        <p>If you see this, the modal system is working.</p>
        <button onClick={onClose} style={{ padding: '10px', marginTop: '10px' }}>
          Close
        </button>
      </div>
    </div>
  );

  // Try to render with portal to document body
  if (typeof window !== 'undefined' && document.body) {
    console.log('Using portal to render modal');
    return createPortal(modalContent, document.body);
  }
  
  // Fallback to normal rendering
  console.log('Using normal rendering for modal');
  return modalContent;
}