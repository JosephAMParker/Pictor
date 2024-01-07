// Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {    
  return (
    <div>
      <h1>Joe Parker</h1>
      <p>Site under contruction</p>
      <p>projects...</p>
      <Link to="/pictor">Pictor</Link>
    </div>
  );
};

export default Home;