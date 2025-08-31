import * as React from "react";
import {
  Button,
  CircularProgress,
  SvgIconTypeMap,
  styled,
} from "@mui/material";
import html2canvas from "html2canvas";
import ChunkAnimation from "./ChunkAnimation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useLocation } from "react-router-dom";

const StartButton = styled(Button)({
  position: "fixed",
  right: "60px",
  top: "calc(50vh - 32px)",
  zIndex: "9999",
  width: "64px", // Adjust the width and height to make it a circle
  height: "64px",
  borderRadius: "50%", // Set border radius to make it a circle
  backgroundColor: "sienna",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const RefreshButton = styled(StartButton)({
  top: "calc(50vh + 50px)",
});

const StartButtonContent = styled("div")({
  color: "white", // Set the color of the text to white
});

const createStyledIcon = (
  IconComponent: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  },
  paddingTop: string
) =>
  styled(IconComponent)({
    fontSize: "3rem", // Adjust the icon size as needed
    paddingTop: paddingTop || 0, // Use the provided paddingTop or default to 0
  });

const StyledWarningAmberIcon = createStyledIcon(WarningAmberIcon, "0px"); // Example: Set paddingTop to '10px'
const StyledCloseIcon = createStyledIcon(CloseIcon, "5px"); // Example: Set paddingTop to '5px'
const StyledReplayIcon = createStyledIcon(ReplayIcon, "5px"); // Example: No specific paddingTop provided

interface DestroyerCanvasDivProps {
  top: number;
}

const DestroyerCanvasDiv = styled("div")<DestroyerCanvasDivProps>((props) => ({
  position: "absolute",
  top: props.top,
  zIndex: 9996,
}));
const ChunkCanvasDiv = styled("div")<DestroyerCanvasDivProps>((props) => ({
  pointerEvents: "none",
  position: "absolute",
  top: props.top,
  zIndex: 9997,
}));

const LoadingOverlay = styled("div")({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(169, 169, 169, 1)", // Light grey with 100% opacity
  zIndex: 10001, // Make sure the overlay is above other elements
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

interface CustomImageData {
  height: number;
  pixelData: Uint8ClampedArray;
  width: number;
  x: number;
  y: number;
  size: number;
  key: string;
}

const Destroyer = () => {
  const location = useLocation();

  const [workerGreenLight, setWorkerGreenLight] = React.useState<Boolean>(true);
  const [imageList, setImageList] = React.useState<CustomImageData[]>([]);
  const [modeOn, setModeOn] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [canvasTop, setCanvasTop] = React.useState(0);
  const [originalScroll, setOriginalScroll] = React.useState([0, 0]);
  const [originalImage, setOriginalImage] = React.useState<ImageData>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chunkCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const removeChunk = React.useCallback(
    (
      keyToRemove: string,
      x: number,
      y: number,
      scale: number,
      rotation: number
    ) => {
      const canvasId = "chunk-" + keyToRemove;
      const canvasElement = document.getElementById(
        canvasId
      ) as HTMLCanvasElement;
      if (canvasElement) {
        const targetCanvas = chunkCanvasRef.current;
        const targetCtx = targetCanvas?.getContext("2d");

        if (targetCtx) {
          // Save the current transformation matrix
          targetCtx.save();

          // Translate the canvas origin to the center of the image
          targetCtx.translate(
            x + canvasElement.width / 2,
            y + canvasElement.height / 2 - window.scrollY
          );

          // const rotateAngle = Math.random() * (2 * Math.PI);
          targetCtx.rotate((rotation * Math.PI) / 180);

          // Scale the canvas
          targetCtx.scale(scale, scale);

          // Draw the crack image on the canvas
          targetCtx.drawImage(
            canvasElement,
            -canvasElement.width / 2,
            -canvasElement.height / 2
          );

          // Restore the original transformation matrix
          targetCtx.restore();
        }
      }
      setImageList((prevImageList) =>
        prevImageList.filter((imageData) => imageData.key !== keyToRemove)
      );
    },
    [setImageList]
  );

  const clearChunks = React.useCallback(() => {
    setImageList([]);
  }, [setImageList]);

  const closeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    const chunkCanvas = chunkCanvasRef.current;
    const chunkContext = canvas?.getContext("2d");

    // Set the canvas size to 1x1 and clear any content
    if (canvas && context && chunkCanvas && chunkContext) {
      canvas.width = 1;
      canvas.height = 1;
      chunkCanvas.width = 1;
      chunkCanvas.height = 1;
      chunkContext.clearRect(0, 0, canvas.width, canvas.height);
      chunkContext.clearRect(0, 0, chunkCanvas.width, chunkCanvas.height);
    }

    if (location.pathname.startsWith("/screen")) {
      document.body.style.position = "";
      window.scrollTo(originalScroll[0], originalScroll[1]);
    } else {
      document.body.style.overflow = "";
    }
  }, [originalScroll, location.pathname]);

  const closeDestroyer = React.useCallback(() => {
    setModeOn(false);
    setLoading(false);
    clearChunks();
    closeCanvas();
  }, [clearChunks, closeCanvas]);

  React.useEffect(() => {
    const handleNavigation = (event: PopStateEvent) => {
      if (event.state) {
        closeDestroyer();
      }
    };
    const handleKeyPress = (event: { key: string; keyCode: number }) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        closeDestroyer();
      }
    };

    // Listen for the 'popstate' event (back/forward button)
    window.addEventListener("popstate", handleNavigation);
    document.addEventListener("keydown", handleKeyPress);
    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [closeDestroyer]);

  React.useEffect(() => {
    function drawCrack(
      e: MouseEvent,
      canvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D
    ) {
      const x = e.clientX - canvas.getBoundingClientRect().left;
      const y = e.clientY - canvas.getBoundingClientRect().top;

      const crackImage = new Image();

      crackImage.onload = () => {
        // Calculate the position to center the image at the click coordinates
        const imageX = x - crackImage.width / 2;
        const imageY = y - crackImage.height / 2;

        // Save the current transformation matrix
        context.save();

        // Translate the canvas origin to the center of the image
        context.translate(
          imageX + crackImage.width / 2,
          imageY + crackImage.height / 2
        );

        // Rotate the canvas by a specified angle (in radians)
        const rotateAngle = Math.random() * (2 * Math.PI);
        context.rotate(rotateAngle);

        // Draw the crack image on the canvas
        context.drawImage(
          crackImage,
          -crackImage.width / 2,
          -crackImage.height / 2
        );

        // Restore the original transformation matrix
        context.restore();
        // Draw white border around frame
        context.strokeStyle = "#FFF";
        context.lineWidth = 2;
        context.strokeRect(0, 0, canvas.width, canvas.height);

        checkCracks();
      };

      crackImage.src = process.env.PUBLIC_URL + "/glass/crack1.png";
      // console.log(crackImage)
    }

    function checkCracks() {
      const worker = new Worker(process.env.PUBLIC_URL + "/glassWorker.js", {
        type: "module",
      });
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      worker.onmessage = (event) => {
        const pixelData = event.data.pixelData;
        const componentPixelData = event.data.componentPixelData;

        const ctx = canvas?.getContext("2d");
        if (canvas && ctx && canvas.width > 1) {
          const newImageData = new ImageData(
            pixelData,
            canvas.width,
            canvas.height
          );
          ctx.putImageData(newImageData, 0, 0);
        }

        setImageList((prevImageList) => [
          ...prevImageList,
          ...componentPixelData,
        ]);

        worker.terminate();
        setWorkerGreenLight(true);
      };

      // Send data to the worker
      if (workerGreenLight) {
        if (canvas && ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixelData = imageData.data;
          worker.postMessage({
            data: pixelData,
            width: canvas.width,
            height: canvas.height,
          });
          setWorkerGreenLight(false);
        }
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");

      // Append the canvas to the predefined div
      if (context) {
        const handleMouseDown = (e: MouseEvent) => {
          if (!(e.buttons === 1) || !workerGreenLight) return;
          drawCrack(e, canvas, context);
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!(e.buttons === 1)) return;
          return;
        };

        const handleMouseUp = () => {
          // checkCracks();
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);
        //targetElement.appendChild(canvas);
        return () => {
          if (canvas && context) {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
          }
        };
      }
    }
  }, [canvasRef, imageList, workerGreenLight]);

  const handleCapture = (body: HTMLElement) => {
    if (canvasRef.current) {
      const old_scrollY = window.scrollY;
      const old_scrollX = window.scrollX;
      setOriginalScroll([old_scrollX, old_scrollY]);
      if (location.pathname.startsWith("/screen")) {
        document.body.style.position = "fixed";
      } else {
        body.style.overflow = "hidden";
      }
      const { innerWidth, innerHeight, scrollY } = window;
      setCanvasTop(scrollY);
      html2canvas(body, { scale: 1 }).then((htmlCanvas) => {
        const canvas = canvasRef.current;
        const chunkCanvas = chunkCanvasRef.current;
        const context = canvas?.getContext("2d");
        if (canvas && context && chunkCanvas) {
          canvas.width = innerWidth;
          canvas.height = innerHeight;

          chunkCanvas.width = innerWidth;
          chunkCanvas.height = innerHeight;

          context.drawImage(
            htmlCanvas,
            old_scrollX,
            old_scrollY,
            innerWidth,
            innerHeight, // Source rectangle
            0,
            0,
            innerWidth,
            innerHeight // Destination rectangle
          );

          // Get the pixel data from the entire canvas
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const data = imageData.data;

          // Make sure no pixels are all 0,0,0 to begin with
          // Loop through each pixel and increase the R value by 1
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(data[i] + 1, 255);
          }

          // Put the modified pixel data back to the canvas
          context.putImageData(imageData, 0, 0);
          setOriginalImage(imageData);
          setLoading(false);
        }
      });
    }
  };

  const startDestroyer = () => {
    setModeOn(true);
    setLoading(true);

    const iframe = document.getElementById(
      "neowise-frame"
    ) as HTMLIFrameElement;

    if (iframe) {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDocument) {
        const iframeBody = iframeDocument.body;

        if (iframeBody) {
          handleCapture(iframeBody);
        }
      }
    } else {
      handleCapture(document.body);
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const chunkCanvas = chunkCanvasRef.current;
    const chunkContext = chunkCanvas?.getContext("2d");
    if (canvas && context && chunkCanvas && chunkContext && originalImage) {
      context.putImageData(originalImage, 0, 0);
      chunkContext.clearRect(0, 0, chunkCanvas.width, chunkCanvas.height);
    }
  };

  const restartDestroyer = () => {
    clearChunks();
    resetCanvas();
  };

  return location.pathname.startsWith("/neowise") ||
    location.pathname.startsWith("/scavenge") ||
    location.pathname.startsWith("/bookclub") ? (
    <></>
  ) : (
    <>
      {loading && (
        <LoadingOverlay>
          <CircularProgress />
        </LoadingOverlay>
      )}

      {!modeOn && (
        <StartButton
          data-html2canvas-ignore="true"
          onClick={startDestroyer}
          color="inherit"
          sx={{ flexGrow: 2 }}
        >
          <StartButtonContent>
            <StyledWarningAmberIcon />
          </StartButtonContent>
        </StartButton>
      )}

      {modeOn && (
        <>
          <StartButton
            data-html2canvas-ignore="true"
            onClick={closeDestroyer}
            color="inherit"
            sx={{ flexGrow: 2 }}
          >
            <StartButtonContent>
              <StyledCloseIcon />
            </StartButtonContent>
          </StartButton>

          <RefreshButton
            data-html2canvas-ignore="true"
            onClick={restartDestroyer}
            color="inherit"
            sx={{ flexGrow: 2 }}
          >
            <StartButtonContent>
              <StyledReplayIcon />
            </StartButtonContent>
          </RefreshButton>
        </>
      )}

      <>
        {imageList.map((imageData) => (
          <ChunkAnimation
            key={imageData.key}
            imageData={imageData}
            removeChunk={removeChunk}
            chunkKey={imageData.key}
          />
        ))}
        <ChunkCanvasDiv id="chunks-div" top={canvasTop}>
          <canvas ref={chunkCanvasRef} width={1} height={1}></canvas>
        </ChunkCanvasDiv>
        <DestroyerCanvasDiv id="screenshot-div" top={canvasTop}>
          <canvas ref={canvasRef} width={1} height={1}></canvas>
        </DestroyerCanvasDiv>
      </>
    </>
  );
};

export default Destroyer;
