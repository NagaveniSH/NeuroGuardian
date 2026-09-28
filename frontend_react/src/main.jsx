import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("NeuroGuardian UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          color: '#FFF',
          fontFamily: 'Inter, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid #EF4444',
            borderRadius: '20px',
            padding: '32px 24px',
            maxWidth: '460px',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FF5252', marginBottom: '10px' }}>
              NeuroGuardian System Notice
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '20px' }}>
              The application encountered a display refresh state. Please click below to reload the console.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('neuroguardian_user');
                window.location.href = '/';
              }}
              style={{
                background: 'linear-gradient(135deg, #00D2FF, #3A7BD5)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Reload NeuroGuardian Console
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
