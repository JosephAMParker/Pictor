import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';  
import Dashboard from './dashboard/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<div><Home /></div>} />
        <Route path="pictor" element={<div><Dashboard /></div>} />
      </Routes>
    </BrowserRouter>
  );
}

// Use ReactDOM.render instead of createRoot
ReactDOM.render(<App />, document.getElementById('root'));