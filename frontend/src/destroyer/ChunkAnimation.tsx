 
import * as React from 'react';  

interface ImageData {
  height: number;
  pixelData: Uint8ClampedArray;
  width: number;
  x: number;
  y: number;
}

interface ChunkAnimationProps {
  imageData: ImageData;
  chunkKey: string
  removeChunk: any
}

function getRandomFloatInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

const ChunkAnimation: React.FC<ChunkAnimationProps> = ({ imageData, removeChunk, chunkKey }) => { 
 
  const startTimeRef = React.useRef(performance.now());
  const positionRef = React.useRef({ x: imageData.x , y: imageData.y + window.scrollY});
  const velocityRef = React.useRef({ x: getRandomFloatInRange(-4, 4), y: -2  + getRandomFloatInRange(-4, 1)});
  const scaleRef = React.useRef(1); 
  const rotateRef = React.useRef(0);
  const rotateVelRef = React.useRef(getRandomFloatInRange(-2, 2));
  const [toRemove, setToRemove] = React.useState(false);

  const animateChunk = React.useCallback((time: number, prevTime:number) => {
    
    if (toRemove){
        return
    }

    if (positionRef.current.x >= window.innerWidth - imageData.width||
        positionRef.current.x <= 0){
        velocityRef.current.x *= -0.75
    }

    if (positionRef.current.y > window.innerHeight - imageData.height + window.scrollY){
        setToRemove(true)
        removeChunk(chunkKey, positionRef.current.x, positionRef.current.y, scaleRef.current, rotateRef.current) 
        return;
    } 

    const elapsedTime = (time - prevTime) / 15;

    // Update position
    positionRef.current.y += velocityRef.current.y * elapsedTime
    positionRef.current.x += velocityRef.current.x * elapsedTime
    velocityRef.current.y += 0.3 * elapsedTime

    // Update scale
    if (scaleRef.current <= 1.5) {
        scaleRef.current += 0.02 * elapsedTime
    } 

    rotateRef.current += rotateVelRef.current * elapsedTime

    // Update the canvas position and scale
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scaleRef.current}) rotate(${rotateRef.current}deg)`;
    }

    // Continue the animation loop 
    requestAnimationFrame((t) => animateChunk(t, time));
    }, [toRemove, imageData.width, imageData.height]);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context && imageData.pixelData && imageData.pixelData.length > 0) {
      canvas.width = imageData.width
      canvas.height = imageData.height
      const newImageData = new ImageData(imageData.pixelData, imageData.width, imageData.height);
      context.putImageData(newImageData, 0, 0);
    } 

    const startTime = performance.now();
    startTimeRef.current = startTime;
    animateChunk(startTime, startTime); 

  }, [imageData.pixelData, imageData.width, imageData.height, animateChunk]); 

  return (
    <canvas
      id={'chunk-' + chunkKey}
      ref={canvasRef}
      style={{
        position: 'absolute',  
        zIndex:9998,
        pointerEvents: 'none', 
        transformOrigin: 'center center'
      }}
    />
  );
};

export default ChunkAnimation;
