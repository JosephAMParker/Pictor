import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home, { ContentPage } from './pages/Home';   
import Pictor from './pages/Pictor';
import { Helmet } from 'react-helmet';
import Destroyer from './destroyer/Destroyer';
import UserSetup from './usersetup/UserSetup'; 
import Neowise from './pages/NeoWise';
import SiteSmash from './pages/SiteSmash';

export default function App() {

  const [homeContent, setHomeContent] = React.useState<ContentPage>(ContentPage.NULL);
  const [message, setMessage] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [urlParameter, setUrlParameter] = React.useState('https://example.com/');
  const [coverLetter, setCoverLetter] = React.useState(null);

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
        <Destroyer /> 
        <UserSetup />
        <Routes>
          <Route index element={<Home content={homeContent} setContent={setHomeContent}
                                      message={message} setMessage={setMessage}
                                      company={company} setCompany={setCompany}
                                      urlParameter={urlParameter} setUrlParameter={setUrlParameter}
                                      coverLetter={coverLetter} setCoverLetter={setCoverLetter} 
                                />} 
          />
          <Route path="pictor" element={<Pictor />} />
          <Route path="neowise" element={<Neowise />} />
          <Route path="screen" element={<SiteSmash />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}  