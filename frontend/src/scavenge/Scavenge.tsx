// Scavenge.tsx 
import * as React from 'react';  
import { Root, Preview, Footer, GlobalStyle } from "./styles";
import { Fragment, useState } from 'react';
import { Camera } from './Camera';
import axios from 'axios';
import { apiUrl } from '../Constants';

const Scavenge: React.FC = () => {   
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState<Blob>();
  const [landmark, setLandmark] = useState<string>();

  function handleCapture(blob: Blob) {  

    setCardImage(blob)
    const formData = new FormData();
    formData.append('imageFile', blob, 'image.jpg'); 
    setLandmark('')
    axios.post(apiUrl +'/api/scavenge-process-image', formData)
      .then(response => {
        setLandmark(response.data.landmark) 
      })
      .catch(error => { 
        console.error('Error uploading image:', error);
        // You can handle errors as needed
      });
  }

  return (
    <Fragment>
      <Root>
        {isCameraOpen && (<>  
            <Camera
              onCapture={(blob: any) => handleCapture(blob)}
              onClear={() => setCardImage(undefined)}
            />
          </>
        )}

        {cardImage && landmark && (
          <div>
            <h2>{landmark}</h2>
            <Preview src={cardImage && URL.createObjectURL(cardImage)} />
          </div>
        )}

        <Footer>
          <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
          <button
            onClick={() => {
              setIsCameraOpen(false);
              setCardImage(undefined);
            }}
          >
            Close Camera
          </button>
        </Footer>
      </Root>
      <GlobalStyle />
    </Fragment>
  );
} 

export default Scavenge;