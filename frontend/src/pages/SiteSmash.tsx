import * as React from 'react';
import axios from 'axios';
import { apiUrl } from '../Constants';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';

const LoadingOverlay = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(169, 169, 169, 1)', // Light grey with 100% opacity
  zIndex: 10001, // Make sure the overlay is above other elements
  display: 'flex',
  flexDirection: 'column',  // Set the flex direction to column
  alignItems: 'center',
  justifyContent: 'center',
  
  '& > div': {
    marginBottom: '10px',  // Add some margin between the circular loading and the text
  },
});

const ErrorDiv = styled('div')({
  position: 'absolute',
  textAlign: 'center',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});


const SiteSmash: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [screenshot, setScreenshot] = React.useState('');
  const [siteUrl, setSiteUrl] = React.useState('');  

  React.useEffect(() => {
    const captureScreenshot = async () => {
      if (!siteUrl){
        return
      }
      try {
        setLoading(true)
        const response = await axios.post(apiUrl + '/api/capture', { url:siteUrl, width:window.innerWidth }, {
          responseType: 'arraybuffer',
        }); 
        const blob = new Blob([response.data], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(blob);
        setScreenshot(imageUrl);
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setHasError(true)
      }
    };
    captureScreenshot();
  }, [siteUrl]);

  React.useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const url = urlSearchParams.get('url');
    if(url){
      setSiteUrl(url)
    } else{
      setSiteUrl('https://example.com/')
    }
  },[])

  return (
    <>
      {loading && 
        <LoadingOverlay>
          <div>
            <CircularProgress />
          </div>
          <div>
            Loading your website. This may take a few minutes.
          </div>
        </LoadingOverlay>
        }
        {hasError && 
          <ErrorDiv>
            <p>Sorry, this site does not seem to be working.</p>
            <p>Please check if you've entered the correct URL.</p>
            <p>If the URL uses HTTP, try replacing it with HTTPS, or vice versa.</p>
            <p>If the problem persists, please try a different URL.</p>
          </ErrorDiv>
        }
        {!hasError && 
          <div style={{ width: '100%', height: '100vh' }}>
            {screenshot && <img src={screenshot} alt="Screenshot" />}
          </div>
        }
    </>
  );
};

export default SiteSmash;
