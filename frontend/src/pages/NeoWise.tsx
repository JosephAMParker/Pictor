import React, { useEffect } from 'react';

const Neowise: React.FC = () => {
  const neowiseSiteUrl = 'https://josephamparker.github.io/neowise-site/'; 

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        id="neowise-frame"
        title="Neowise Site"
        src={neowiseSiteUrl} 
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
};

export default Neowise;