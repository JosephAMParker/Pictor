import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import React from 'react'; 

const directionImages = [
    {
        img: process.env.PUBLIC_URL + '/showpath.jpeg',
        title: 'Show Path (Sine)' 
    },
    {
        img: process.env.PUBLIC_URL + '/sortDown.jpeg',
        title: 'Line' 
    },
    {
        img: process.env.PUBLIC_URL + '/sortCurve.jpeg',
        title: 'Curve' 
    },
    {
        img: process.env.PUBLIC_URL + '/sortSine.jpeg',
        title: 'Sine' 
    },
]

const DirectionAndPath = () => {    
  return ( 
    <> 
        <h1>Direction And Path Type</h1>
        <div> 
        <p>To pick the direction of the pixel sorting use the direction compass in the top right corner.</p> 
        <p>There are several different path types and settings you can use for different effects. To use them:</p> 
        <ul>
          <li>Click on the 'Path Type' dropdown in the menu on the left.</li>
          <li>Select a Path Type.</li>
          <li>Click on the 'Path Settings' dropdown in the menu on the left.</li> 
          <li>Check 'Show Graph' to show an overlay of the current Path Settings</li>
          <li>Adjust Path Settings to you liking.</li>
          <li>Press 'Sort'.</li>
        </ul>
        </div>
        <ImageList  cols={4} rowHeight={500}>
            {directionImages.map((item) => (
                <ImageListItem key={item.img}>
                <img
                    srcSet={`${item.img}?w=500&h=500&fit=crop&auto=format&dpr=2 2x`}
                    src={`${item.img}?w=500&h=500&fit=crop&auto=format`}
                    alt={item.title}
                    loading="lazy"
                />
                <ImageListItemBar title={item.title} />
                </ImageListItem>
            ))}
        </ImageList>

    </>
  );
};

export default DirectionAndPath;