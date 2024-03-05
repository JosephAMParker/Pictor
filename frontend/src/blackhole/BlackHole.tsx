import * as React from 'react';
import { Button, ButtonGroup, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Slider, ThemeProvider, createTheme, styled } from '@mui/material';
import { green, lightGreen } from '@mui/material/colors';

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
    paddingTop:'20px'
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
    const ri_template = 'ring-';
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
    const marks = [ 
        {
            value: 33,
            label: '90°',
        },
        {
            value: 32,
            label: '85°',
        },
        {
            value: 31,
            label: '75°',
        },
        {
            value: 30,
            label: '65°',
        },
        {
            value: 29,
            label: '55°',
        },
        {
            value: 28,
            label: '45°',
        },
        {
            value: 27,
            label: '35°',
        },
        {
            value: 26,
            label: '25°',
        },
        {
            value: 25,
            label: '20°',
        },
        {
            value: 24,
            label: '15°',
        },
        {
            value: 23,
            label: '10°',
        },
        {
            value: 22,
            label: '5°',
        },
        {
            value: 21,
            label: '4°',
        },
        {
            value: 20,
            label: '3°',
        },
        {
            value: 19,
            label: '2°',
        },
        {
            value: 18,
            label: '1°',
        },
        {
            value: 17,
            label: '0.1°',
        },
        {
            value: 16,
            label: '-0.1°',
        }, 
        {
            value: 11,
            label: '-5°', 
        },
        {
            value: 5,
            label: '-45°', 
        },
        {
            value: 0,
            label: '90°', 
        },
    ];

    const imageNames = React.useRef<string[]>(imageNumbers.map  (n => bh_template + n + extension)) 
    const newtNames = React.useRef<string[]>(imageNumbers.map   (n => ne_template + n + extension))
    const ghostNames = React.useRef<string[]>(imageNumbers.map  (n => gh_template + n + extension))
    const primaryNames = React.useRef<string[]>(imageNumbers.map(n => pr_template + n + extension))  

    const [mainImageList, setMainImageList] = React.useState<string[]>([]);
    const [ghostList, setGhostList] = React.useState<string[]>([]); 
    const [primaryList, setPrimaryList] = React.useState<string[]>([]);
    const [newtonianList, setNewtonianList] = React.useState<string[]>([]);  
    const [imageIdx, setImageIdx] = React.useState(11)

    const [highlight, setHighlight] = React.useState(HighlightState.NONE);
    const [showNewtonian, setShowNewtonian] = React.useState(false);
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const animationRef = React.useRef(0) 
    
    const canvasWidth = React.useRef(1206);
    const canvasHeight = React.useRef(678); 

    const [canvasDimensions, setCanvasDimensions] = React.useState({ width: 0, height: 0 });

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

