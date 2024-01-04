import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

const DrawingApp = (props) => {
    const { useStar, useMask, setStarPoint, penSize, drawMode, initialized, setInitialized, height, width, forwardedRef, hidden, originalImage, inFilter }  = props
    const imageDataRef = useRef(null);
    const outFilterRef = useRef(null);
    const inFilterRef = useRef(null); 
    const originalRef = useRef(null);
    const canvasRef = useRef(null); 
    const starBurstRef = useRef(null);
    
    const [isDrawing, setIsDrawing] = React.useState(false);

     
    const initializeCanvas = () => {
    
        // set original canvas
        const origCanvas = originalRef.current;
        const orgctx = origCanvas.getContext('2d'); 
        
        origCanvas.width  = width;
        origCanvas.height = height;
    
        // set in canvas
        const inCanvas = inFilterRef.current;
        const inctx = inCanvas.getContext('2d'); 
        
        inCanvas.width  = width;
        inCanvas.height = height;
        
        const blobUrl = originalImage; 
        const img = new Image(); 
        img.onload = function() {
          // Draw the image onto the canvas
          inctx.drawImage(img, 0, 0, inCanvas.width, inCanvas.height); 
          orgctx.drawImage(img, 0, 0, origCanvas.width, origCanvas.height); 
        };
        img.src = blobUrl;
        
        // set out canvas
        const outCanvas = outFilterRef.current; 
        outCanvas.width  = width;
        outCanvas.height = height; 
        
        //set drawing canvas
        const canvas = canvasRef.current;  
        canvas.width  = width;
        canvas.height = height; 

        //set star canvas
        const starCanvas = starBurstRef.current;  
        starCanvas.width  = width;
        starCanvas.height = height; 

        setInitialized(true);
    }
    
    const clearCanvases = () => {
        const origCanvas = originalRef.current;
        const orgctx = origCanvas.getContext('2d');  
        
        const inCanvas = inFilterRef.current;
        const inctx = inCanvas.getContext('2d');
        
        const outCanvas = outFilterRef.current;
        const outctx = outCanvas.getContext('2d');

        const blobUrl = originalImage; 
        const img = new Image(); 
        

        img.onload = function() {
          // Draw the image onto the canvas 
            inctx.globalCompositeOperation = 'source-in';
            orgctx.globalCompositeOperation = 'source-in';
            outctx.globalCompositeOperation = 'source-in';
            
            inctx.drawImage(img, 0, 0, inCanvas.width, inCanvas.height);  
            orgctx.drawImage(img, 0, 0, origCanvas.width, origCanvas.height); 
            outctx.drawImage(img, 0, 0, origCanvas.width, origCanvas.height); 
            
            inctx.globalCompositeOperation = 'source-over';
            orgctx.globalCompositeOperation = 'source-over';
            outctx.globalCompositeOperation = 'source-over';
        };
        img.src = blobUrl;
    }
    
    useLayoutEffect(() => {
    
        if(!initialized && originalImage && width > 0 && height > 0){
            initializeCanvas(); 
        } else {
            clearCanvases(); 
        }   
        
    },[originalImage, width, height]) 
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        const inCanvas = inFilterRef.current;
        const inContext = inCanvas.getContext('2d');
        
        const outCanvas = outFilterRef.current;
        const outContext = outCanvas.getContext('2d');
        
        const orgCanvas = originalRef.current;
        const origContext = orgCanvas.getContext('2d');
        
        const rect = canvas.getBoundingClientRect();
      
        const drawArc = (e) => {
            
            
            if(!useMask){
                return
            }

            const doDraw = (draw, erase, offsetX, offsetY, radius) => {
                draw.globalCompositeOperation = 'destination-out';
                draw.beginPath();
                draw.arc(offsetX, offsetY, radius, 0, 2 * Math.PI);
                draw.fillStyle = 'rgba(0, 0, 0, 1)';
                draw.fill();
                draw.globalCompositeOperation = 'source-over';
                
                erase.save();
                erase.beginPath();
                erase.arc(offsetX, offsetY, radius, 0, 2 * Math.PI);
                erase.clip();
                erase.drawImage(orgCanvas, 0, 0);
                erase.restore();  
            }
            
            const offsetX = (width/rect.width) * e.offsetX
            const offsetY = (height/rect.height) * e.offsetY 
            const radius = penSize


            if(drawMode === 'draw'){
                context.beginPath();
                context.arc(offsetX, offsetY, radius, 0, 2 * Math.PI);
                context.fillStyle = 'rgba(128, 128, 192)';
                context.fill();

                doDraw(inContext, outContext, offsetX, offsetY, radius);
                
            } else if(drawMode === 'erase') {
                context.globalCompositeOperation = 'destination-out';
                context.beginPath();
                context.arc(offsetX, offsetY, radius, 0, 2 * Math.PI);
                context.fillStyle = 'rgba(0, 0, 0, 1)';
                context.fill();
                context.globalCompositeOperation = 'source-over';

                doDraw(outContext, inContext, offsetX, offsetY, radius);

            } else if(drawMode === 'star') {
                const starCanvas = starBurstRef.current;
                const starContext = starCanvas.getContext('2d');

                starContext.clearRect(0, 0, starCanvas.width, starCanvas.height);
                const radius = starCanvas.width / 500
                starContext.beginPath();
                starContext.arc(offsetX, offsetY, 8 * radius, 0, 2 * Math.PI);
                starContext.fillStyle = 'rgba(222, 33, 22, 0.4)';
                starContext.fill(); 

                starContext.beginPath();
                starContext.arc(offsetX, offsetY, 5 * radius, 0, 2 * Math.PI);
                starContext.fillStyle = 'rgba(44, 43, 234, 0.7)';
                starContext.fill(); 

                starContext.beginPath();
                starContext.arc(offsetX, offsetY, 2 * radius, 0, 2 * Math.PI);
                starContext.fillStyle = 'rgba(44, 222, 22)';
                starContext.fill(); 

                setStarPoint([offsetX, offsetY])
            }
             
        }
    
        const handleMouseDown = (e) => {
            drawArc(e); 
            setIsDrawing(true);
        };
          
        const handleMouseMove = (e) => { 
            if (!isDrawing) return; 
            drawArc(e);
        };
          
        const handleMouseUp = () => { 
            setIsDrawing(false);
        };
          
        const handleMouseLeave = () => { 
            setIsDrawing(false);
        };
          
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseLeave);
          
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
        
    }, [drawMode, penSize, isDrawing, width, height, useMask]);
     
    const updateCanvasAndRef = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (width > 0 && height > 0) {
            imageDataRef.current = context.getImageData(0, 0, width, height);
        }
        
        const getBlob = async () => {
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                });
            });
        }
        
        const handleClearCanvas = () => { 
        
            // clear drawing canvas
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // clear in canvas
            const inCanvas = inFilterRef.current;
            const inctx = inCanvas.getContext('2d');   
            const origCanvas = originalRef.current;
            inctx.drawImage(origCanvas, 0, 0);
            const blobUrl = originalImage;  
            
            // set out canvas
            const outCanvas = outFilterRef.current; 
            const outContext = outCanvas.getContext('2d');
            outContext.clearRect(0, 0, outCanvas.width, outCanvas.height);
            
            updateCanvasAndRef();
        };
         
        forwardedRef.current = {
            getBlob, handleClearCanvas
        };
    } 
    
    useEffect(() => { 
        updateCanvasAndRef();
    }, [forwardedRef, canvasRef, width, height, isDrawing]);

  return (
    <>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, opacity: useMask ? 0.25 : 0}}>
          <canvas ref={canvasRef} style={{width: '100%', height: '100%', maxWidth: '100%', margin: 0, padding: 0 }}/>
        </div>
        <div hidden={!useMask || inFilter} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9}}>
          <canvas ref={inFilterRef} style={{width: '100%', height: '100%', maxWidth: '100%', margin: 0, padding: 0}}/>
        </div>
        <div hidden={!useMask || !inFilter} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9}}>
          <canvas ref={outFilterRef} style={{width: '100%', height: '100%', maxWidth: '100%', margin: 0, padding: 0}}/>
        </div>
        <div hidden style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9}}>
          <canvas ref={originalRef} style={{width: '100%', height: '100%', maxWidth: '100%', margin: 0, padding: 0}}/>
        </div> 
        <div hidden={!useStar} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9}}>
            <canvas ref={starBurstRef} style={{width: '100%', height: '100%', maxWidth: '100%', margin: 0, padding: 0}}/>
        </div>
    </>
  );
};

export default DrawingApp;
