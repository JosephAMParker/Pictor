// Pictor.tsx
import * as React from 'react';
import Dashboard from '../dashboard/Dashboard';
import Examples from '../examples/Examples';
import { Button, styled } from '@mui/material'; 
import Gallery from '../examples/Gallery';

const CenteredBox = styled('div')`
&& { 
  width: 100%;
  max-width: calc(100% - 2em); 
  text-align: center; 
  padding:10px;
} 
`; 

const Pictor = () => {    
    const examplesRef = React.useRef<HTMLDivElement | null>(null);
    const [showGallery, setShowGallery] = React.useState(false);

    const handleScrollToExamplesAndGallery = (showGalleryPage : boolean) => {
      // Scroll to the top of the Examples component
      examplesRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowGallery(showGalleryPage)
    }; 

    return (
        <>
            <div style={{'height':'110vh'}}><Dashboard scrollToExamples={handleScrollToExamplesAndGallery}/></div>
            <CenteredBox ref={examplesRef}> 
                  <Button 
                    onClick={() => setShowGallery(false)}  
                    color="inherit" 
                     >
                      Help And Examples
                  </Button>
                  <Button 
                    onClick={() => setShowGallery(true)}  
                    color="inherit" 
                     >
                      Gallery
                  </Button>
                  <Button color="inherit" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Scroll to Top</Button>
            </CenteredBox>
            {showGallery && <div><Gallery/></div>}
            {!showGallery && <div><Examples/></div>}
            <CenteredBox> 
                <Button color="inherit" onClick={() => handleScrollToExamplesAndGallery(showGallery)}>Scroll Up</Button>
            </CenteredBox>
        </>
    );
};

export default Pictor;