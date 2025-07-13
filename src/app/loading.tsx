// src/app/loading.tsx
export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fffbeb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        <span style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#F59E0B' 
        }}>
          ශ්‍රී
        </span>
        <span style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1F2937' 
        }}>
          Express
        </span>
      </div>

      {/* Loading Animation */}
      <div style={{
        position: 'relative',
        width: '60px',
        height: '60px',
        marginBottom: '1.5rem'
      }}>
        {/* Spinning ring */}
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          border: '4px solid #fcd34d',
          borderTop: '4px solid #F59E0B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>

      {/* Loading Text */}
      <h2 style={{
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: '0.5rem'
      }}>
        Loading...
      </h2>

      <p style={{
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        Please wait while we prepare your transportation experience
      </p>

      {/* Loading dots animation */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        marginTop: '1rem'
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#F59E0B',
              borderRadius: '50%',
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}