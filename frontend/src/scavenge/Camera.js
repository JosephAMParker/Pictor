import React, { useState, useRef } from "react";
import Measure from "react-measure"; 
import {
  Video,
  Canvas,
  Wrapper,
  Container,
  Flash,
  Overlay,
  Button
} from "./cameraStyles";
import { useCardRatio } from "./hooks/use-card-ratio";
import { useOffsets } from "./hooks/use-offsets";
import { useUserMedia } from "./hooks/use-user-media";

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: "environment", width: 640, height: 640 } 
};

export function Camera({ onCapture, onClear }) {
  const canvasRef = useRef();
  const videoRef = useRef();

  const [container, setContainer] = useState({ width: 0, height: 0, size: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const [aspectRatio, calculateRatio] = useCardRatio(1.586);
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  function handleResize(contentRect) {
    if (contentRect.width > contentRect.height){
      setContainer({
        width: contentRect.bounds.height,
        height: contentRect.bounds.height,
        size: contentRect.bounds.height,
      });
    } else{
      setContainer({
        width: contentRect.bounds.width,
        height: contentRect.bounds.width,
        size: contentRect.bounds.width,
      });
    } 
  }

  function handleCanPlay() {
    calculateRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    setIsVideoPlaying(true);
    videoRef.current.play();
  }

  function handleCapture() {
    const context = canvasRef.current.getContext("2d");

    const videoHeight = videoRef.current.videoHeight 
    const videoWidth = videoRef.current.videoWidth 

    const s = (videoWidth - videoHeight)/2

    context.drawImage(
      videoRef.current,
      s,
      0,
      videoWidth - s*2,
      videoHeight, 
      0,
      0,
      context.canvas.width,
      context.canvas.height,
    );

    canvasRef.current.toBlob(blob => onCapture(blob), "image/jpeg", 1);
    setIsCanvasEmpty(false);
    setIsFlashing(true);
  }

  function handleClear() {
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
    onClear();
  }

  if (!mediaStream) {
    return null;
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <Wrapper>
          <Container
            ref={measureRef}
            maxheight={videoRef.current && videoRef.current.videoWidth}
            maxwidth={videoRef.current && videoRef.current.videoWidth}
            style={{
              height: `${container.size}px`
            }}
          >
            <Video
              ref={videoRef}
              hidden={!isVideoPlaying}
              onCanPlay={handleCanPlay}
              autoPlay
              playsInline
              muted  
              style={{
                top: `-${offsets.y}px`,
                left: `-${offsets.x}px`, 
                width: `${container.size}px`, // Set width to height to make it square
                height: `${container.size}px` // Set height to container.height
              }} 
            />

            <Overlay hidden={!isVideoPlaying} />

            <Canvas
              ref={canvasRef}
              width={224}
              height={224}
            />

            <Flash
              flash={isFlashing}
              onAnimationEnd={() => setIsFlashing(false)}
            />
          </Container>

          {isVideoPlaying && (
            <Button onClick={isCanvasEmpty ? handleCapture : handleClear}>
              {isCanvasEmpty ? "Take a picture" : "Take another picture"}
            </Button>
          )}
        </Wrapper>
      )}
    </Measure>
  );
}
