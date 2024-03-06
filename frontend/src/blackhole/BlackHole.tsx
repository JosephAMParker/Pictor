import * as React from 'react';
import { Box, Button, ButtonGroup, FormControl, FormControlLabel, FormLabel, Grid, Modal, Radio, RadioGroup, Slider, ThemeProvider, Typography, createTheme, styled } from '@mui/material';
import { green, lightGreen } from '@mui/material/colors'; 
import { Close } from '@mui/icons-material';

const overLayColor = 'rgba(3, 245, 3, 1)'
const defaultTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: green,
        secondary: lightGreen,
    },
});

const SliderDiv = styled('div')({ 
    height:'100%',  
}); 

const PhysicsLabel = styled(FormLabel)({
    'white-space': 'nowrap'
})

const PageContainer = styled('div')({
    height: '100vh',
    backgroundColor:'black',  
});

const ControlPanel = styled('div')({ 
    height: '100%',
    display: 'flex', 
    'flex-direction': 'column',  
    'min-width': '150px',
});
 
const GridContainer = styled(Grid)({ 
    height:'100%',
    padding:'20px'
})

const CheckBoxContainer = styled(Grid)({ 
    height:'100%', 
})

const RadioFormControl = styled(FormControl)({ 
    color:'white',
    paddingTop:'20px',
    paddingBottom:'20px',
}) 

const AboutButtonGroup = styled(ButtonGroup)({  
    paddingBottom:'20px',
})  

const ModalBox = styled(Box)({  
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40vw',
    maxHeight: '85vh', // Limiting the maximum height of the modal
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Very dark color with 75% opacity
    border: '2px solid #000',
    boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.5)',
    color: '#4CAF50',
    padding: '20px',
    overflow: 'auto',
    display: 'flex', // Adding flexbox properties
    flexDirection: 'column', // Aligning items vertically
    alignItems: 'center', // Centering items horizontally
    '& img': {
        maxWidth: '100%',
        maxHeight: '100%', // Making sure the image fits within the modal
        margin: '10px 0', // Adjusting margin for better spacing
    },
});

const CloseButton = styled(Button)({ 

})

enum HighlightState {
    NONE = 'none',
    PRIMARY = 'primary',
    GHOST = 'ghost',
} 


const BlackHole = () => { 
    
    const bh_template = 'bh-';
    const pr_template = 'primary-';
    const gh_template = 'ghost-';
    // const ri_template = 'ring-';
    const ne_template = 'newtonian-';
    const extension = '.png';
    const imageNumbers = [
        '1',
        '5', 
        '15',
        '25',
        '35',
        '45',
        '55',
        '65',
        '70',
        '75',
        '80',
        '85',
        '86',
        '87',
        '88',
        '89',
        '89.9',
    ]

    const marks = imageNumbers.map((number, index) => {
        const value = 90 - parseFloat(number);
        const label = value < 1 ? value.toFixed(1) : value;
        return {
            value: imageNumbers.length * 2 - index - 1,
            label: `${label}°`,
        };
    });

    marks.push(...imageNumbers.map((number, index) => {
        const value = 90 - parseFloat(number);
        const label = value < 1 ? value.toFixed(1) : value;
        return {
            value: index,
            label: `${label}°`,
        };
    })) 

    const imageNames = React.useRef<string[]>(imageNumbers.map  (n => bh_template + n + extension)) 
    const newtNames = React.useRef<string[]>(imageNumbers.map   (n => ne_template + n + extension))
    const ghostNames = React.useRef<string[]>(imageNumbers.map  (n => gh_template + n + extension))
    const primaryNames = React.useRef<string[]>(imageNumbers.map(n => pr_template + n + extension))  

    const [mainImageList, setMainImageList] = React.useState<string[]>([]);
    const [ghostList, setGhostList] = React.useState<string[]>([]); 
    const [primaryList, setPrimaryList] = React.useState<string[]>([]);
    const [newtonianList, setNewtonianList] = React.useState<string[]>([]);  
    const [imageIdx, setImageIdx] = React.useState(10)

    const [highlight, setHighlight] = React.useState(HighlightState.NONE);
    const [showNewtonian, setShowNewtonian] = React.useState(false);
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const [open, setOpen] = React.useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    const canvasWidth = React.useRef(1206);
    const canvasHeight = React.useRef(678); 

    const [canvasDimensions, setCanvasDimensions] = React.useState({ width: 0, height: 0 });
    React.useEffect(() => {

        const handleScroll = (event: WheelEvent) => {

            if (open){
                return
            }

            if (event.deltaY < 0) { // Scrolling up
                setImageIdx(prevIdx => Math.min(imageNames.current.length * 2, prevIdx + 1));
            }
            if (event.deltaY > 0) { // Scrolling up
                setImageIdx(prevIdx => Math.max(0, prevIdx - 1));
            }
        };

        window.addEventListener('wheel', handleScroll); // Listen for mouse scroll event

        return () => {
            window.removeEventListener('wheel', handleScroll); // Clean up event listener on component unmount
        };
    }, [open, imageNames.current.length]);

    React.useEffect(() => {
        const updateCanvasDimensions = () => {
            const maxWidth = window.innerWidth - 40;
            const maxHeight = window.innerHeight - 40;

            const aspectRatio = canvasWidth.current / canvasHeight.current; // Aspect ratio of your image

            let newWidth = maxWidth;
            let newHeight = newWidth / aspectRatio;

            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = newHeight * aspectRatio;
            }

            newWidth  = Math.max(1, newWidth)
            newHeight = Math.max(1, newHeight)

            setCanvasDimensions({ width: newWidth, height: newHeight });
        };
    
        updateCanvasDimensions();
    
        window.addEventListener('resize', updateCanvasDimensions);
    
        return () => {
            window.removeEventListener('resize', updateCanvasDimensions);
        };
    }, []);

    React.useEffect(() => {  
        
        let idx = imageIdx
        let flip = false
        let imageList
        if (showNewtonian){
            imageList = newtonianList
        } else{
            imageList = mainImageList
        }
        if (imageIdx > imageList.length - 1){
            idx  = imageList.length * 2 - imageIdx - 1
            flip = true 
        } 

        const image = imageList[idx] 

        let secondImage
        switch (highlight) {
            case HighlightState.PRIMARY:
                secondImage = primaryList[idx]  
                break;
            case HighlightState.GHOST:
                secondImage = ghostList[idx]  
                break;
        } 

        if (!image){
            return
        } 

        const img = new Image();
        const second_img = new Image(); 

        const loadAndDrawOneImage = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx || !canvas){
                return
            } 
            let startHeight = 0
            if (flip){ 
                ctx.save(); 
                ctx.scale(1,-1) 
                startHeight = -canvas.height
            }
            ctx.drawImage(img, 0, startHeight, canvas.width, canvas.height);
            ctx.restore(); 
        }

        const loadAndDrawImages = () => {
            const bothLoaded = img.complete && second_img.complete
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            const greenOverlay=document.createElement('canvas');
            const greenCtx=greenOverlay.getContext('2d');

            const colorOverlay=document.createElement('canvas');
            const colorCtx=colorOverlay.getContext('2d');

            if (!ctx || !canvas || !bothLoaded || !greenCtx || !colorCtx){
                return
            }  
            let startHeight = 0
            if (flip){ 
                ctx.save();
                greenCtx.save();
                ctx.scale(1,-1)
                greenCtx.scale(1,-1)
                startHeight = -canvas.height
            }
            ctx.drawImage(img, 0, startHeight, canvas.width, canvas.height);

            // colorOverlay.width=img.width;
            // colorOverlay.height=img.height;
            // colorCtx.drawImage(img,0,0);
            // colorCtx.globalCompositeOperation='source-atop';
            // colorCtx.fillStyle='rgba(123, 22, 22, 1)';
            // colorCtx.fillRect(0,0,img.width,img.height);  
            // colorCtx.globalCompositeOperation='source-over'; 

            // ctx.globalCompositeOperation='color';  
            // ctx.drawImage(colorOverlay, 0, startHeight); 
            // ctx.globalCompositeOperation='source-over';  

            greenOverlay.width=second_img.width;
            greenOverlay.height=second_img.height;
            greenCtx.drawImage(second_img,0,0);
            greenCtx.globalCompositeOperation='source-atop';
            greenCtx.fillStyle=overLayColor;
            greenCtx.fillRect(0,0,second_img.width,second_img.height);  
            greenCtx.globalCompositeOperation='source-over'; 

            ctx.globalCompositeOperation='color';  
            ctx.drawImage(greenOverlay, 0, startHeight, canvas.width, canvas.height);
            ctx.globalCompositeOperation='source-over'; 

            ctx.restore();
            greenCtx.restore();
        }

        if (secondImage) {
            img.onload = second_img.onload = loadAndDrawImages;
            img.src = image;
            second_img.src = secondImage;
        } else {
            img.onload = loadAndDrawOneImage;
            img.src = image; 
        }  

      }, [mainImageList, newtonianList, imageIdx, ghostList, highlight, primaryList, canvasDimensions, showNewtonian]); 


    React.useEffect(() => {  

          const loadImageList = async () => {
            try {
              const promises = imageNames.current.map(async (imageName) => {
                const response = await fetch(`${process.env.PUBLIC_URL}/blackhole/${imageName}`);
                if (!response.ok) {
                  throw new Error(`Failed to load image ${imageName}`);
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
              });

              const ghostPromises = ghostNames.current.map(async (imageName) => {
                const response = await fetch(`${process.env.PUBLIC_URL}/blackhole/${imageName}`);
                if (!response.ok) {
                  throw new Error(`Failed to load image ${imageName}`);
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
              });

              const primaryPromises = primaryNames.current.map(async (imageName) => {
                const response = await fetch(`${process.env.PUBLIC_URL}/blackhole/${imageName}`);
                if (!response.ok) {
                  throw new Error(`Failed to load image ${imageName}`);
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
              }); 

              const newtonianPromises = newtNames.current.map(async (imageName) => {
                const response = await fetch(`${process.env.PUBLIC_URL}/blackhole/${imageName}`);
                if (!response.ok) {
                  throw new Error(`Failed to load image ${imageName}`);
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
              });
              
              const imageUrls = await Promise.all(promises);
              const ghostUrls = await Promise.all(ghostPromises); 
              const primaryUrls = await Promise.all(primaryPromises); 
              const newtonianUrls = await Promise.all(newtonianPromises);
              setMainImageList(imageUrls);
              setGhostList(ghostUrls);
              setPrimaryList(primaryUrls);
              setNewtonianList(newtonianUrls); 

            } catch (error) {
              console.error('Error loading images:', error);
            }
          };
      
          loadImageList();
    },[])

    const handleSliderChange = (event: Event, value: number | number[]) => {
        setImageIdx(value as number); 
    }; 
    
    return (  
        <ThemeProvider theme={defaultTheme}>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="about-modal"
                aria-describedby="about-modal"
                > 
                <ModalBox>
                    <Typography variant="h6" component="h2">
                        Black Hole Visualization
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        An interactive implementation of Jean-Pierre Luminet's <a href="https://articles.adsabs.harvard.edu/pdf/1979A%2526A....75..228L" target="_blank" rel="noopener noreferrer">Image of a spherical black hole with thin accretion disk (1979)</a>.
                        The first "image" of a black hole, plotted by hand on negative Canson paper with black India ink.  
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Original Image by Jean-Pierre Luminet (1979):
                    </Typography>
                    <img src={process.env.PUBLIC_URL + '/blackhole/luminet_bh.jpg'} alt="Original Black Hole" />  
                    <Typography sx={{ mt: 2 }}>
                        Below is a diagram explaining the optical distortions near a black hole.
                        The light emitted from the upper side of the disk forms a direct or 'Primary' image and is considerably distorted
                        so that it is completely visible. The lower side of the disk is also visible as 
                        the 'Secondary' image caused by highly curved light rays.
                        <br/>
                        <br/>
                        In Luminet's original image shown above, he decided to omit the secondary image. 
                    </Typography>
                    <img src={process.env.PUBLIC_URL + '/blackhole/diagram.jpg'} alt="Black Hole Diagram" />
                    <Typography sx={{ mt: 2 }}>
                        To further help in understanding you can highlight either the primary or secondary images.
                        Also, you can switch between Einsteinian and Newtonian physics models to showcase the affects of gravitational lensing.  
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        With Newtonian physics selected, the image you will see will resemble planetary rings.
                        Imagine Saturn but the planet itself is a pure black sphere.
                    </Typography>

                    <CloseButton onClick={handleClose} sx={{ mt: 2 }}>
                        Close <Close />
                    </CloseButton>

                </ModalBox> 
            </Modal>
            <PageContainer> 
                <GridContainer container spacing={0}> 
                    <Grid item xs={1}>
                        <ControlPanel>
                            <CheckBoxContainer container spacing={0}> 
                                <Grid item xs={6}>
                                    <SliderDiv>
                                        <Slider
                                            orientation="vertical"
                                            min={0}
                                            max={imageNames.current.length*2 - 1}
                                            value={imageIdx}
                                            onChange={handleSliderChange}
                                            aria-label="Image Slider"
                                            marks={marks}
                                        />
                                    </SliderDiv>
                                </Grid>
                                <Grid item xs={6}> 
                                    <AboutButtonGroup id="Physics-Model" variant="contained" aria-label="Basic button group">
                                        <Button variant="contained" key="one" onClick={() => handleOpen()}>
                                                        About  
                                        </Button>   
                                    </AboutButtonGroup>
                                    <PhysicsLabel id="Physics-Model">Physics Model</PhysicsLabel>
                                    <ButtonGroup id="Physics-Model" variant="contained" aria-label="Basic button group">
                                        <Button variant="contained" key="one" onClick={() => {setShowNewtonian((show) => !show);
                                                                        setHighlight(HighlightState.NONE)}}>
                                                        {showNewtonian ?  'Newtonian' : 'Einsteinian'}  
                                        </Button>   
                                    </ButtonGroup>
                                    {!showNewtonian && 
                                        <RadioFormControl>
                                            <FormLabel id="highlight-radio-buttons-group-label">Highlight Image</FormLabel>
                                            <RadioGroup
                                                aria-labelledby="highlight-radio-buttons-group-label"
                                                value={highlight}
                                                onChange={(event) => {setHighlight(event.target.value as HighlightState)}}
                                            >
                                                <FormControlLabel value={HighlightState.NONE}    control={<Radio />} label="NONE" />
                                                <FormControlLabel value={HighlightState.PRIMARY} control={<Radio />} label="PRIMARY" />
                                                <FormControlLabel value={HighlightState.GHOST}   control={<Radio />} label="SECONDARY" />
                                            </RadioGroup>
                                        </RadioFormControl>
                                    } 
                                </Grid>
                            </CheckBoxContainer>
                        </ControlPanel>
                    </Grid>
                
                    <Grid item xs={8}>
                        <div id="black-hole-div"> 
                            <canvas ref={canvasRef} width={canvasDimensions.width} height={canvasDimensions.height}></canvas>
                        </div>  
                    </Grid>
                </GridContainer> 
            </PageContainer>
        </ThemeProvider>
    );
};

export default BlackHole;

