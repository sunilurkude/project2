import React from 'react';

type Props = {
  message: string;
  onClose: () => void;
  [key: string]: any;
};

const ErrorModal: React.FC<Props> = (props) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#ef4444', marginTop: 0 }}>Error</h2>
        <p style={{ margin: '20px 0', color: '#333' }}>{props.message}</p>
        <button 
          onClick={props.onClose}
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
