import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import React from 'react'; 

const directionImages = [
    {
      img: process.env.PUBLIC_URL + '/nomaskc.jpeg',
      title: 'No Masking', 
    },
    {
      img: process.env.PUBLIC_URL + '/noblurc.jpeg',
      title: 'Masking', 
    },
    {
      img: process.env.PUBLIC_URL + '/maskc.jpeg',
      title: 'Masking with Blend', 
    },
]

const Masking = () => {    
  return ( 
    <> 
      <h1>Masking</h1>
      <div> 
        <img
          style={{
            width: '40vw', 
            objectFit: 'cover', // Zoom in to cover the container
            objectPosition: 'center', // Center the image within the container
          }} 
          src={process.env.PUBLIC_URL + '/maskbefore.jpeg'}
          alt={'ufo'}
          loading="lazy"
        />
      </div>
      <div>
        <p>You can use masking to select which parts of the image will be affected. For example, for the above image, you may wish to keep the UFO untouched.</p>
        <ul>
          <li>Click on the 'Masking' dropdown in the menu on the left.</li>
          <li>Check 'Use Mask'.</li>
          <li>Select 'Draw'.</li>
          <li>Draw a small circle around the UFO.</li>
          <li>Check 'Invert Mask' - with this checked, pixels outside of the drawn mask will be selected.</li>
          <li>Check 'Blur Mask'   - with this checked the edges of the mask will be blured to blend in with the rest of the image.</li>
          <li>Press 'Sort'.</li>
        </ul>
        <p>You may wish to keep 'Show Affected Pixels' on while drawing so you can easily see which pixels are being selected.</p>
      </div>

      <ImageList cols={3} rowHeight={333} sx={{width: '65vw', margin:'auto'}}>
          {directionImages.map((item) => (
              <ImageListItem key={item.img}>
              <img
                  style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover', // Zoom in to cover the container
                      objectPosition: 'center', // Center the image within the container
                  }}
                  srcSet={`${item.img}?w=333&h=333&fit=crop&auto=format&dpr=2 2x`}
                  src={`${item.img}?w=333&h=333&fit=crop&auto=format`}
                  alt={item.title}
                  loading="lazy"
              />
              <ImageListItemBar title={item.title}   />
              </ImageListItem>
          ))}
      </ImageList> 
    </>
  );
};

export default Masking;