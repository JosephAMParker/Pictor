// Scavenge.tsx 
import * as React from 'react'; 
import ReactDOM from "react-dom"; 
import { Root, Preview, Footer, GlobalStyle } from "./styles";
import { Fragment, useState } from 'react';
import { Camera } from './Camera';

const Scavenge: React.FC = () => {   
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();

  return (
    <Fragment>
      <Root>
        {isCameraOpen && (<>
          camera here
          <Camera
            onCapture={(blob: any) => setCardImage(blob)}
            onClear={() => setCardImage(undefined)}
          />
          </>
        )}

        {cardImage && (
          <div>
            <h2>Preview</h2>
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