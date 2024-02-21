import { styled } from '@mui/material';
import * as React from 'react';

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
    
    const [image, setImage] = React.useState<string | null>(null);
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const animationRef = React.useRef(0) 
    
    const canvasWidth = React.useRef(903);
    const canvasHeight = React.useRef(451);
    const zValues: number[][] = [];

    React.useEffect(() => {    

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
                            const index = (y * canvas.width + x) * 4; // Each pixel is represented by 4 values (RGBA)
                            const random = Math.random();
                            const imageValue = 8
                            const an = bhImageData.data[index]
                            // Determine color based on random value and image pixel value
                            const color =  (an*1 + 10)+10
                
                            // Set pixel color in the image data
                            
                            imageData.data[index] = color; // Red
                            imageData.data[index + 1] = color; // Green
                            imageData.data[index + 2] = color; // Blue
                            imageData.data[index + 3] = 255; // Alpha (fully opaque)

                        }
                    }

                    // Put the modified pixel data back to the canvas
                    ctx.putImageData(imageData, 0, 0);
                    const frameDuration = 1000/12
                    const animationTimer = setTimeout(() => {
                        animationRef.current = requestAnimationFrame((t) => animate(t, time));
                      }, frameDuration);
                    
                };
                ctx.fillStyle = 'rgba(0, 0, 0, 255)'; // Fully opaque black color
                ctx.fillRect(0, 0, canvas.width, canvas.height); 
                const img = new Image();
                
                animate(performance.now(), performance.now()); // Start the animation loop
                
                img.src = image;
            }

            const handleMouseDown = (event: MouseEvent) => {
                if (!(event.buttons === 1)) return;
                // setAvoidPoint([event.x, event.y]) 
            }
            const handleMouseUp = () => {
                // setAvoidPoint([]) 
            }

            document.addEventListener('mousedown', handleMouseDown);
            // document.addEventListener('mousemove', handleMouseDown);
            document.addEventListener('mouseleave', handleMouseUp);
            document.addEventListener('mouseup', handleMouseUp);

        
            // Cleanup function
            return () => {
                document.removeEventListener('mousedown', handleMouseDown);
                // document.removeEventListener('mousemove', handleMouseDown); 
                document.removeEventListener('mouseleave', handleMouseUp);
                document.removeEventListener('mouseup', handleMouseUp);
                cancelAnimationFrame(animationRef.current);
            };

        };
        img.src = image;

      }, [image]);


    React.useEffect(() => {
        const loadImage = async () => {
            try {
              const response = await fetch(process.env.PUBLIC_URL + 'blackhole/bh1.png');
              if (!response.ok) {
                throw new Error('Failed to load image');
              }
              const blob = await response.blob();
              setImage(URL.createObjectURL(blob));
            } catch (error) {
              console.error('Error loading image:', error);
            }
          };
      
          loadImage();
    },[])
    
    return (  
        <CanvasDiv id="black-hole-div">
            <CanvasO ref={canvasRef} width={canvasWidth.current} height={canvasHeight.current}></CanvasO>
        </CanvasDiv> 
    );
};

export default BlackHole;

