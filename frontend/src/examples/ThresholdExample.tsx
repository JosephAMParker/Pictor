import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import React from 'react'; 

const directionImages = [
    {
      img: process.env.PUBLIC_URL + '/threshold1.jpeg',
      title: 'Threshold',
      subtitle: 'Adjust Threshold To Select Desired Pixels'
    },
    {
      img: process.env.PUBLIC_URL + '/threshold2.jpeg',
      title: 'Result',
      subtitle: 'Only Selected Pixels Will Sort'
    }, 
]

const ThresholdExample = () => {    
  return ( 
    <> 
        <h1>Threshold</h1>
        <div>
          <p>The Threshold Min/Max slider at the top of the screen is used to select which pixels will be included in the pixel sorting based on their brightness. 
            The threshold bar goes from 0 to 255 and pixels with brightness greater than Min and less than Max will be selected.</p>
          <p>You may wish to keep 'Show Affected Pixels' on while drawing so you can easily see which pixels are being selected.</p> 
          <p>In the example below the threshold bar is adjusted so only the brighter pixels of the sky are selected, leaving the rest of the image untouched.</p> 
        </div>
        <ImageList cols={2} rowHeight={300} style={{ width: '66vw', maxHeight: '300px', overflow: 'hidden' }}>
            {directionImages.map((item) => (
                <ImageListItem key={item.img}>
                <img
                    srcSet={`${item.img}?w=900&h=500&fit=crop&auto=format&dpr=2 2x`}
                    src={`${item.img}?w=900&h=500&fit=crop&auto=format`}
                    alt={item.title}
                    loading="lazy"
                />
                <ImageListItemBar title={item.subtitle} />
                </ImageListItem>
            ))}
        </ImageList> 
    </>
  );
};

export default ThresholdExample;