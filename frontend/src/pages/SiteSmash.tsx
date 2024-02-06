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


const SiteSmash: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
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
        console.error('Error:', error);
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
      <div style={{ width: '100%', height: '100vh' }}>
        {screenshot && <img src={screenshot} alt="Screenshot" />}
      </div>
    </>
  );
};

export default SiteSmash;
