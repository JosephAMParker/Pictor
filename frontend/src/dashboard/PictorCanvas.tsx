import * as React from 'react';
import styled from 'styled-components'; 
import DrawingApp from './DrawingApp';
import PictorGraph from './PictorGraph';

const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const StyledImage = styled.img`  
    width:100%;
    max-height: 90vh;
    user-drag: none;
    -webkit-user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none; 
`; 

const PictorCanvasContainer = styled.div`
    font-size: 0;
    position: relative ;
    display: inline-block;
    overflow: hidden;
`;

const ThresholdImage = styled.img`
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto
`;

type PictorCanvasProps = {
    imageWidth: any
    imageHeight: any
    drawingAppRef: any
    useMask: boolean
    processedImage: any
    inFilter: any
    initialized: any
    setInitialized: any
    drawMode: any
    penSize: any
    setStarPoint: any 
    showThresh: any
    threshImage: any
    useStar: boolean
    pathType:string 
    amp:number
    freq:number
    xPos:number
    rotationAngle: number
    showGraph: boolean
}

export default function PictorCanvas(props:PictorCanvasProps){  

    const {
        imageWidth,
        imageHeight,
        drawingAppRef,
        useMask,
        processedImage,
        inFilter,
        initialized,
        setInitialized,
        drawMode,
        penSize,
        setStarPoint, 
        showThresh,
        threshImage,
        useStar,
        pathType,
        amp,
        freq,
        xPos,
        rotationAngle,
        showGraph
    } = props

    const preventImageDrag = (e: any) => {
        e.preventDefault();
    }; 

    const handleMouseDown = (e: any) => {
        e.preventDefault();
    };

    return (      
        <PictorCanvasContainer>  
            <Overlay>  
                <DrawingApp
                    width={imageWidth} 
                    height={imageHeight} 
                    forwardedRef={drawingAppRef} 
                    hidden={!useMask}   
                    useMask={useMask}
                    originalImage={processedImage}
                    inFilter={inFilter}
                    initialized={initialized}
                    setInitialized={setInitialized}
                    drawMode={drawMode}
                    penSize={penSize}
                    setStarPoint={setStarPoint}
                    useStar={useStar}
                />
            </Overlay>  
            <StyledImage src={processedImage} alt="Original"        
                onMouseDown={handleMouseDown}
                onDragStart={preventImageDrag} 
            />
            {showThresh && threshImage && (
                <ThresholdImage src={threshImage} alt="threshold" /> 
            )} 
            {showGraph && showGraph && (
                <PictorGraph 
                    pathType={pathType}
                    w={imageWidth} 
                    h={imageHeight}
                    amp={amp}
                    freq={freq}
                    xPos={xPos}
                    rotationAngle={rotationAngle} 
                />
            )} 
        </PictorCanvasContainer> 
    )
}