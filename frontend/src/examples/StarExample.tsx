import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import React from 'react'; 

const directionImages = [
    {
      img: process.env.PUBLIC_URL + '/stardog1.jpeg',
      title: 'stardog1',
      subtitle: 'Place Star Center'
    },
    {
      img: process.env.PUBLIC_URL + '/stardog2.jpeg',
      title: 'stardog2',
      subtitle: 'Sort With "Use Star" Checked',
    } 
]

const StarExample = () => {    
  return ( 
    <> 
        <h1>Radiate From Point</h1>
        <div> 
          <p>You can use the Star to have the sorting radiate from a point.</p> 
          <ul>
          <li>Click on the 'Star' dropdown in the menu on the left.</li> 
          <li>Click on 'Use Star'.</li> 
          <li>Click on 'Place Star Center'.</li>
          <li>Click on your image where ever you want the center to be.</li>
          <li>Adjust threshold and masking settings to your liking.</li>
          <li>Press 'Sort'.</li>
        </ul>
        </div>
        <ImageList  cols={2} rowHeight={500}>
            {directionImages.map((item) => (
                <ImageListItem key={item.img}>
                <img
                    srcSet={`${item.img}?w=500&h=500&fit=crop&auto=format&dpr=2 2x`}
                    src={`${item.img}?w=500&h=500&fit=crop&auto=format`}
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

export default StarExample;