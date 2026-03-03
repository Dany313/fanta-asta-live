import React from 'react';

// Le "props" sono i parametri in ingresso del componente
// children è una prop speciale di React che rappresenta il contenuto tra i tag <Button>...</Button>
export default function CustomButton({ children, onClick, variant = 'primary', style }) {
  
  // Definiamo un dizionario di colori in base alla "variante"
  const colors = {
    primary: '#0984e3',   // Blu
    success: '#00b894',   // Verde
    danger: '#ff4757',    // Rosso
    warning: '#fdcb6e'    // Giallo
  };

  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: colors[variant] || colors.primary,
        color: 'white',
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        ...style // Permette di sovrascrivere lo stile se necessario
      }}
    >
      {children}
    </button>
  );
}