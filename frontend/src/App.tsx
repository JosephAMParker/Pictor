import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';   
import Pictor from './pages/Pictor';
import { Helmet } from 'react-helmet';

export default function App() {
  return (
    <>
      <Helmet>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HC7CCHZVMP"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HC7CCHZVMP');
          `}
        </script>
      </Helmet>
      <BrowserRouter>
        <Routes>
          <Route index element={<div><Home /></div>} />
          <Route path="pictor" element={<div><Pictor /></div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

// Use ReactDOM.render instead of createRoot
ReactDOM.render(<App />, document.getElementById('root'));