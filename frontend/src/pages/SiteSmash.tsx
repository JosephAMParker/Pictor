import * as React from 'react';
import axios from 'axios';
import { apiUrl } from '../Constants';

const SiteSmash: React.FC = () => {
  const [screenshot, setScreenshot] = React.useState('');
  const [siteUrl, setSiteUrl] = React.useState('');  

  React.useEffect(() => {
    const captureScreenshot = async () => {
      if (!siteUrl){
        return
      }
      try {
        const response = await axios.post(apiUrl + '/api/capture', { url:siteUrl, width:window.innerWidth }, {
          responseType: 'arraybuffer',
        }); 
        const blob = new Blob([response.data], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(blob);
        setScreenshot(imageUrl);
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
    <div style={{ width: '100%', height: '100vh' }}>
      {screenshot && <img src={screenshot} alt="Screenshot" />}
    </div>
  );
};

export default SiteSmash;
