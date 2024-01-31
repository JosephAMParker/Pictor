import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'; 
import Typography from '@mui/material/Typography'; 
import Container from '@mui/material/Container';  
import Resizer from 'react-image-file-resizer'; 
import Input from '@mui/material/Input';
import { useEffect, useState } from 'react';
import PictorCanvas from './PictorCanvas';
import axios from 'axios';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Compass from './Compass';
import DashboardList from './DashboardList';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { apiUrl } from '../Constants';

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      Joseph Parker
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth: number = 333;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    marginRight: drawerWidth,
    width: `calc(100% - ${2*drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const PhotoContainer = styled(Container)`
    && {
        margin: 0;
        width: 100%;
        max-width: none;
        margin-top: 0;
    }
`; 

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      flexGrow:1,
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const RightDiv = styled('div')({ 
    width: drawerWidth
});

const BoxLeft = styled(Box)({ 
  minWidth: drawerWidth,
  width: drawerWidth
});

const RightDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
      right: 0, // Position the drawer on the right side
    },
  }),
);

const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const MAX_PIXEL_SIZE = 2500*2500

type DashboardProps = {
  scrollToExamples: (showGallery:boolean) => void;
}

export default function Dashboard(props:DashboardProps) { 

  const {scrollToExamples} = props;  
  
  const [processedImage, setProcessedImage] = useState('');  
  const [originalImage, setOriginalImage] = useState('');
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);  
  const [threshImage, setThreshImage] = useState('');  
  const [sortDirection, setSortDirection] = useState(0)
  const [threshold, setThreshold] = React.useState([45, 220]);
  const [intervalType, setIntervalType] = React.useState('threshold');
  const [redThreshold, setRedThreshold] = React.useState([45, 220]);
  const [greenThreshold, setGreenThreshold] = React.useState([45, 220]);
  const [blueThreshold, setBlueThreshold] = React.useState([45, 220]);
  const [starPoint, setStarPoint] = React.useState([0,0])
  const [penSize, setPenSize] = React.useState(50);
  const [bleed, setBleed] = React.useState(0);
  const [inFilter, setInFilter] = React.useState(false);
  const [showThresh, setShowThresh] = React.useState(false)
  const [showFilter, setShowFilter] = React.useState(true)
  const [blend, setBlend] = React.useState(true)
  const [showEdges, setShowEdges] = React.useState(false)
  const [initialized, setInitialized] = React.useState(false);
  const [useColorFilter, setUseColorFilter] = React.useState(false); 
  const [useMask, setUseMask] = React.useState(false);
  const [drawMode, setDrawMode] = React.useState('draw');
  const [useStar, setUseStar] = React.useState(false);
  const [pathType, setPathType] = React.useState('line');
  const [disableSort, setDisableSort] = useState(false)
  const [disableSettings, setDisableSettings] = useState(false)
  const [pathAmp, setPathAmp] = useState(50)
  const [pathX, setPathX] = useState(0)
  const [pathFreq, setPathFreq] = useState(50) 
  const [showGraph, setShowGraph] = useState(false) 

  const drawingAppRef = React.useRef<any>(); 

  // Handle Pixel Sort
  const handlePixelSort = async () => { 
    
      setDisableSort(true)

      try { 
          // Create a FormData object to append the processed image file
          const formData = new FormData(); 
          
          const imageUrl = processedImage;
          const imageBlob = await fetch(imageUrl).then(r => r.blob());
          const filterBlob = drawingAppRef.current?.getBlob && await drawingAppRef.current.getBlob();
          
          formData.append('imageFile', imageBlob , 'imageFile');
          formData.append('filterFile', filterBlob , 'filterFile');
          formData.append('direction', sortDirection.toString());
          formData.append('useMask', useMask.toString()); 
          formData.append('blend', blend.toString());
          formData.append('inFilter', inFilter.toString());
          formData.append('bleed', bleed.toString());
          formData.append('low', threshold[0].toString());
          formData.append('high', threshold[1].toString());
          formData.append('intervalType', intervalType)
          formData.append('createVideo', false.toString()); 
          formData.append('pathType', pathType.toString()); 
          formData.append('pathAmp', pathAmp.toString());
          formData.append('pathX', pathX.toString());
          formData.append('pathFreq', pathFreq.toString());

          if (intervalType === 'edge'){
              formData.append('showEdges', showEdges.toString());
          } else {
              formData.append('showEdges', false.toString()); 
          }

          if (useStar) {
              formData.append('starPoint', starPoint.toString());
          } 
          
          // Send the file to the backend for processing
          const response = await axios.post(apiUrl + '/api/process-image', formData, { responseType: 'arraybuffer' });
          setDisableSort(false)
          const contentType = response.headers['content-type']; 
          
          if (contentType === 'image/jpeg') {
              const processedImageBlob = new Blob([response.data], { type: 'image/jpeg' });
              const processedImageUrl = URL.createObjectURL(processedImageBlob);
              setProcessedImage(processedImageUrl);
          }
          
      } catch (error) {
          console.error('Error processing image:', error);
          setDisableSort(false)
      }
  };              
  // Handle Pixel Sort


  // Handle File input
  const fileInputRef = React.createRef<HTMLInputElement>();
  const handleUploadImage = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event : any) => {
    const file = event.target.files[0];

    if (!file){
      return
    }

    // Check if the file type is an image
    if (!file.type.startsWith('image/')) {
      console.error('Selected file is not an image.'); 
      return;
    }

    const { width, height } = await getImageDimensions(file);
    if(width * height > MAX_PIXEL_SIZE) {
      try { 
          const resizedBlob = await resizeImage(file, width, height);
          const resizedImageUrl = URL.createObjectURL(resizedBlob);
          handleSetImage(resizedImageUrl);
        } catch (error) {
          console.error('Error resizing image:', error);
        }
    } else {
        const fileUrl = URL.createObjectURL(file);
        handleSetImage(fileUrl);
    } 
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
  
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
  
      img.onerror = (error) => {
        reject(error);
      };
  
      img.src = URL.createObjectURL(file);
    });
  };

  const resizeImage = (file : any, width: number, height: number) : any => {
    return new Promise(async (resolve, reject) => {
      const targetFileSize = MAX_PIXEL_SIZE; // pixel size 

      // Calculate the proportional resize factor based on the target file size
      const resizeFactor = Math.sqrt(width * height / targetFileSize)
      
      // Calculate the new width and height
      const newWidth = Math.round(width / resizeFactor);
      const newHeight = Math.round(height / resizeFactor);
      
      Resizer.imageFileResizer(
        file,
        newWidth,  // New width
        newHeight,
        'JPEG',  // Output format (JPEG, PNG, WEBP, etc.)
        100,  // Image quality (0 to 100)
        0,    // Rotation in degrees
        (uri) => {
          const blob = dataURLtoBlob(uri as string);
          resolve(blob);
        },
        'base64'  // Output type (base64, blob, file)
      );
    });
  };

  const dataURLtoBlob = (dataURL: string) => {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  const handleSetImage = (imageUrl : string) => {
      setProcessedImage(imageUrl);
      setOriginalImage(imageUrl); 
      
      const img = new Image();
      img.onload = () => {
          setImageWidth(img.width);
          setImageHeight(img.height);
          setInitialized(false); 
      }
      img.src = imageUrl;   
  }
  // Handle File input

  const handleAnyThresholdChange = (fn: any, thresh: any, newValue: any, activeThumb: any) => {
    const minDistance = 1;
    if (!Array.isArray(newValue)) {
        return;
    }

    if (activeThumb === 0) {
        fn([Math.min(newValue[0], thresh[1] - minDistance), thresh[1]]);
    } else {
        fn([thresh[0], Math.max(newValue[1], thresh[0] + minDistance)]);
    } 
  }
  const handleThresholdChange = (event: any, newValue: any, activeThumb: any) => {
    handleAnyThresholdChange(setThreshold, threshold, newValue,  activeThumb);
  };  

  const applyThreshold = () => {

    setDisableSettings(true)
    
    const img = new Image();
    img.onload = () => { 

        const canvas: HTMLCanvasElement = document.getElementById('threshold-canvas') as HTMLCanvasElement;  
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
          
        canvas.width  = img.width;
        canvas.height = img.height;
          
        // Draw the original image
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img, 0, 0, img.width, img.height);
          
        // Apply the threshold filter
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        const lowThreshold  = threshold[0]
        const highThreshold = threshold[1]
          
        for (let i = 0; i < data.length; i += 4) {
              
            //                         R                 G                     B
            const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
            if (!useColorFilter){
                if (brightness >= lowThreshold && brightness <= highThreshold) {
                    data[i]     = 45;  // R
                    data[i + 1] = 255; // G
                    data[i + 2] = 45;  // B
                } 
                continue; 
            } 

            const total = (data[i] + data[i+1] + data[i+2])/255

            if ((data[i]/total >= redThreshold[0]      && data[i]/total <= redThreshold[1])       &&
               (data[i + 1]/total >= greenThreshold[0] && data[i + 1]/total <= greenThreshold[1]) &&
               (data[i + 2]/total >= blueThreshold[0]  && data[i + 2]/total <= blueThreshold[1])) {
                    data[i]     = 99;  // R
                    data[i + 1] = 255; // G
                    data[i + 2] = 45;  // B
            } 
        }
          
        ctx.putImageData(imageData, 0, 0);
          
        // Draw the processed image with transparency
        ctx.globalAlpha = 0.5; // Adjust the transparency level as needed
        ctx.drawImage(img, 0, 0, img.width, img.height);
          
        // Set the processed image state with the canvas data URL
        setThreshImage(canvas.toDataURL());  
        setDisableSettings(false)
           
    };

    img.src = processedImage;
  }; 

  useEffect(() => { 
    applyThreshold();
  }, [processedImage]); 

  const handleRestart = () => {
    setProcessedImage(originalImage) 
  }

  const handleClearCanvas = () => {
    drawingAppRef.current.handleClearCanvas(); 
  }  

  const handleSave = () => { 
    window.open(processedImage, '_blank');
  };

  // Dashboard List
  const listFunctions = { 
    handleClearCanvas,
    handleUploadImage, 
    handlePixelSort,
    imageWidth,
    disableSort,
    useMask,
    setUseMask,
    drawMode,
    setDrawMode,
    penSize,
    setPenSize,
    inFilter, 
    setInFilter,
    blend,
    setBlend,
    showThresh, 
    setShowThresh,
    useStar,
    setUseStar,
    intervalType, 
    setIntervalType,
    pathType, 
    setPathType,
    pathAmp, 
    setPathAmp,
    pathX,
    setPathX,
    pathFreq,
    setPathFreq,
    showGraph,
    setShowGraph
  };
  // Dashboard List

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' , flexDirection: 'row',  justifyContent: 'space-between'}}>
        <CssBaseline /> 

        <BoxLeft> 
          <DashboardList {...listFunctions}/> 
        </BoxLeft>

        <Box component="main"  sx={{
                  maxWidth: `calc(100% - ${drawerWidth * 2}px)`, // Subtracting the width of the two side boxes  
                  margin: 'auto',  
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  flexGrow: 1
                }}> 
            <Box
                sx={{ 
                  overflow: 'hidden',
                  margin: 'auto',
                  display: 'flex',
                  flexDirection: 'column', 
                  p: 1,
                  m: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1, 
                }}
              >
              <Box> 
                  <Button 
                    onClick={handleUploadImage} 
                    disabled={disableSort}
                    color="inherit" 
                    sx={{ flexGrow: 2 }}>
                      Upload Image
                  </Button>
                  <Button 
                    onClick={handleRestart} 
                    disabled={disableSort}
                    color="inherit" 
                    sx={{ flexGrow: 2 }}>
                      Reset Image
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={disableSort}
                    color="inherit" 
                    sx={{ flexGrow: 2 }}>
                      Save Image
                  </Button>
                  <Button 
                    onClick={() => scrollToExamples(false)} 
                    disabled={disableSort}
                    color="inherit" 
                    sx={{ flexGrow: 2, color:'tomato'}}
                    endIcon={<HelpOutlineIcon sx={{mt:'-5px'}}/>}>
                      Help and Examples
                  </Button> 
                  <Button 
                    onClick={() => scrollToExamples(true)} 
                    disabled={disableSort}
                    color="inherit" 
                    sx={{ flexGrow: 2 }}  >
                      Gallery
                  </Button> 
              </Box> 
              <Typography id="threshold-slider-label" 
              sx={{pl: '7px', mb: '-11px'}} gutterBottom>
                Threshold Min/Max
              </Typography>
              <Slider
                disabled={disableSettings}
                getAriaLabel={() => 'Threshold Min/Max'}
                value={threshold}
                onChange={handleThresholdChange}
                onChangeCommitted={applyThreshold}
                valueLabelDisplay="auto" 
                disableSwap 
                max={255}
              /> 
          </Box>
         
          <Box sx={{overflow:'hidden' }}> 
              <PictorCanvas 
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                drawingAppRef={drawingAppRef}
                useMask={useMask}
                processedImage={processedImage}
                inFilter={inFilter}
                initialized={initialized}
                setInitialized={setInitialized}
                drawMode={drawMode}
                penSize={penSize}
                setStarPoint={setStarPoint} 
                showThresh={showThresh}
                threshImage={threshImage}
                useStar={useStar}
                pathType={pathType}  
                amp={pathAmp}
                freq={pathFreq}
                xPos={pathX}
                rotationAngle={sortDirection}
                showGraph={showGraph} 
                
              />  
          </Box> 
          <Copyright sx={{ pt: 4 }} />
        </Box>

        <BoxLeft> 
          <Compass direction={sortDirection} setDirection={setSortDirection} />
        </BoxLeft>

      </Box>

      <Input
        type="file"
        inputRef={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    <canvas id="threshold-canvas" style={{ display: 'none' }}></canvas>
    </ThemeProvider>
  );
}
