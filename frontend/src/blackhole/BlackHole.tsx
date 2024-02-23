import { Slider, styled } from '@mui/material';
import * as React from 'react';

const ContainerDiv = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    position: 'fixed',
    right: 50,
    top: 0,
    padding: '80px',
    zIndex: 1000, // Ensure the slider is on top 
});

const CanvasDiv = styled('div')({
    pointerEvents: 'none', 
    position: 'absolute',
    top:20,
    left:20,
    zIndex:2,
    width:window.innerWidth-40,
    // height:window.innerHeight-40,
    height:'100%'
})  

const CanvasO = styled('canvas')({
    width:'inherit'
})

const BlackHole = () => { 
    
    const imageName_template = 'boscaled_finalty.png';
    const imageNames = React.useRef<string[]>([
        '1' + imageName_template,
        '5' + imageName_template, 
        '15' + imageName_template, 
        '25' + imageName_template, 
        '35' + imageName_template, 
        '45' + imageName_template, 
        '55' + imageName_template, 
        '65' + imageName_template,
        '70' + imageName_template,
        '75' + imageName_template,
        '80' + imageName_template,
        '85' + imageName_template,
        '86' + imageName_template,
        '87' + imageName_template,
        '88' + imageName_template,
        '89' + imageName_template,
        '89.9' + imageName_template,
      ]);
    const [imageList, setImageList] = React.useState<string[]>([]);
    const [imageIdx, setImageIdx] = React.useState(0)
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const animationRef = React.useRef(0) 
    
    const canvasWidth = React.useRef(1366);
    const canvasHeight = React.useRef(768);
    const zValues: number[][] = [];

    React.useEffect(() => {  
        
        let idx = imageIdx
        let flip = false
        if (imageIdx > imageList.length){
            idx  = imageList.length * 2 - imageIdx
            flip = true 
        }
        const image = imageList[idx]
        console.log(imageIdx)

        if (!image){
            return
        }

        const img = new Image();
        img.onload = () => {

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            const imgCanvas = document.createElement('canvas');
            imgCanvas.width = img.width;
            imgCanvas.height = img.height;
            const imgCtx = imgCanvas.getContext('2d')
            imgCtx?.drawImage(img, 0, 0, img.width, img.height);
            const bhImageData = imgCtx?.getImageData(0,0,img.width, img.height);

            if (ctx && canvas && bhImageData){ 
            
                const animate = (time:number, prevTime:number) => {

                    const elapsedTime = (time - prevTime) / 17

                    if (document.hidden) {
                        animationRef.current = requestAnimationFrame((t) => animate(t, time));
                        return
                    }

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {  
                            let _y = y
                            if (flip){
                                _y = canvas.height - y - 1;
                            }
                            const index = (_y * canvas.width + x) * 4; // Each pixel is represented by 4 values (RGBA)
                            const random = Math.random();
                            const imageValue = 8
                            const an = bhImageData.data[index] * 1.2 + 10
                            // Determine color based on random value and image pixel value
                            const color = (an)
                
                            // Set pixel color in the image data
                            const index2 = (y * canvas.width + x) * 4;
                            imageData.data[index2] = color; // Red
                            imageData.data[index2 + 1] = color; // Green
                            imageData.data[index2 + 2] = color; // Blue
                            imageData.data[index2 + 3] = 255; // Alpha (fully opaque)

                        }
                    }

                    // Put the modified pixel data back to the canvas
                    ctx.putImageData(imageData, 0, 0);
                    const frameDuration = 1000/6
                    const animationTimer = setTimeout(() => { 
                        // animationRef.current = requestAnimationFrame((t) => animate(t, time));
                    }, frameDuration);
                    
                };
                ctx.fillStyle = 'rgba(0, 0, 0, 255)'; // Fully opaque black color
                ctx.fillRect(0, 0, canvas.width, canvas.height); 
                const img = new Image();
                
                animate(performance.now(), performance.now()); // Start the animation loop
                
                img.src = image;
            } 
        };
        img.src = image;

      }, [imageList, imageIdx]);

    React.useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (!(event.buttons === 1)) return;  
        } 

        document.addEventListener('mousedown', handleMouseDown);   
        // Cleanup function
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);  
            cancelAnimationFrame(animationRef.current);
        };
    },[])


    React.useEffect(() => {  

          const loadImageList = async (imageNames: string[]) => {
            try {
              const promises = imageNames.map(async (imageName) => {
                const response = await fetch(`${process.env.PUBLIC_URL}/blackhole/${imageName}`);
                if (!response.ok) {
                  throw new Error(`Failed to load image ${imageName}`);
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
              });
        
              const imageUrls = await Promise.all(promises);
              setImageList(imageUrls);
            } catch (error) {
              console.error('Error loading images:', error);
            }
          };
      
          loadImageList(imageNames.current);
    },[])

    const handleSliderChange = (event: Event, value: number | number[]) => {
        setImageIdx(value as number);
    };
    
    return (  
        <>
            <CanvasDiv id="black-hole-div">
                <CanvasO ref={canvasRef} width={canvasWidth.current} height={canvasHeight.current}></CanvasO>
            </CanvasDiv> 
            <ContainerDiv>
                <Slider
                    orientation="vertical"
                    min={0}
                    max={imageNames.current.length*2 - 1}
                    value={imageIdx}
                    onChange={handleSliderChange}
                    aria-label="Image Slider"
                />
            </ContainerDiv>
        </>
    );
};

export default BlackHole;

