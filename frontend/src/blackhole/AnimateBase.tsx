import { styled } from '@mui/material';
import * as React from 'react';

const CanvasDiv = styled('div')({
    pointerEvents: 'none', 
    position: 'absolute',
    top:20,
    left:20,
    zIndex:2,
    width:window.innerWidth-40,
    height:window.innerHeight-40,
})  

const CanvasO = styled('canvas')({
    width:'inherit'
})
const BlackHole = () => {   
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const animationRef = React.useRef(0) 

    React.useEffect(() => { 

        const drawBlackHole = (canvas:HTMLCanvasElement, context:CanvasRenderingContext2D) => {  
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Make sure no pixels are all 0,0,0 to begin with
            // Loop through each pixel and increase the R value by 1
            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % canvas.width;  
                // const y = Math.floor((i / 4) / canvas.width); 
                // data[i]   = y  
                // data[i+1] = y
                // data[i+2] = y
            }

            // Put the modified pixel data back to the canvas
            context.putImageData(imageData, 0, 0);
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx && canvas){ 
        
            const animate = (time:number, prevTime:number) => {

                const elapsedTime = (time - prevTime) / 17

                if (document.hidden) {
                    animationRef.current = requestAnimationFrame((t) => animate(t, time));
                    return
                }
                
                // ctx.clearRect(0, 0, canvas.width, canvas.height);   

                drawBlackHole(canvas, ctx);  
            
                // Request the next animation frame
                animationRef.current = requestAnimationFrame((t) => animate(t, time));
            };
            ctx.fillStyle = 'rgba(0, 0, 0, 255)'; // Fully opaque black color
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            animate(performance.now(), performance.now()); // Start the animation loop
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

      }, []);
    
    return (  
        <CanvasDiv id="black-hole-div">
            <CanvasO ref={canvasRef} width={(window.innerWidth - 40)/3} height={(window.innerHeight - 40)/3}></CanvasO>
        </CanvasDiv> 
    );
};

export default BlackHole;

