import React, { useRef, useEffect, useState } from 'react'; 
import axios from 'axios';
import styled from 'styled-components';
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import DrawingApp from './DrawingApp';
import Compass from './Compass';
import VideoDisplay from './VideoDisplay'; 
import FormControlLabel from '@mui/material/FormControlLabel'; 
import TextField from '@mui/material/TextField';
import Resizer from 'react-image-file-resizer';
import EditIcon from '@mui/icons-material/Edit'; 
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import StarIcon from '@mui/icons-material/Star'; 
import MenuItem from '@mui/material/MenuItem';  


const TopContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

const PenMenu = styled.div` 
    flex-direction: column;
    display: flex;
    gap: 10px;
`

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ButtonContainer = styled.div`
    
`;

const StyledImage = styled.img` 
    height: 85vh;  
    flex-shrink: 0; /* Prevent shrinking in the horizontal direction */
    user-drag: none;
    -webkit-user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none; 
`; 

const FileInput = styled.input`
    display: none;
`; 
//TODO, merge two images. 
//create gif of each image going from 0 to full threshold.
//full threshold is just a mash of pixels. lerp from one pixel mush to the other then play the other gif in reverse

//scale down the image for the frontend if too large. avoid lagggg 
//apply filter before anything, to avoid fold over when using curves. 
function App() { 

    const [processedImage, setProcessedImage] = useState('');
    const [processedVideo, setProcessedVideo] = useState('');
    
    const [originalImage, setOriginalImage] = useState('');
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
    const [drawMode, setDrawMode] = React.useState('draw');
    
    const [imageWidth, setImageWidth] = React.useState(0);
    const [imageHeight, setImageHeight] = React.useState(0);
    
    const drawingAppRef = useRef();

    ///const apiUrl = 'http://192.168.1.74:5000';
    const apiUrl = 'http://10.0.0.101:5000';

    useEffect(() => {
        axios.get(apiUrl, { responseType: 'arraybuffer' })
            .then(response => {
                const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
                const imageUrl = URL.createObjectURL(imageBlob);
                handleSetImage(imageUrl)
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);
    
    useEffect(() => { 
      applyThreshold();
    }, [processedImage]);  
    
    const handleSetImage = (imageUrl) => {
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
    const handleCreateVideo = () => {
        handlePixelSort(true);
    }
    const handlePixelSort = async (createVideo=false) => {   

        try {
        
            // Create a FormData object to append the processed image file
            const formData = new FormData(); 
            
            const imageUrl = processedImage;
            const imageBlob = await fetch(imageUrl).then(r => r.blob());
            const filterBlob = await drawingAppRef.current.getBlob();
            
            formData.append('imageFile', imageBlob , 'imageFile');
            formData.append('filterFile', filterBlob , 'filterFile');
            formData.append('direction', sortDirection);
            formData.append('createVideo', createVideo); 
            formData.append('blend', blend); 
            formData.append('inFilter', inFilter); 
            formData.append('bleed', bleed);
            formData.append('low', threshold[0]);
            formData.append('high', threshold[1]); 
            formData.append('intervalType', intervalType)

            if (intervalType === 'edge'){
                formData.append('showEdges', showEdges) 
            } else {
                formData.append('showEdges', false) 
            }

            if (drawMode === 'star') {
                formData.append('starPoint', starPoint);
            }
            
            // Send the file to the backend for processing
            const response = await axios.post(apiUrl + '/api/process-image', formData, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];
            
            if (contentType === 'video/mp4') {
                
                const processedVideoBlob = new Blob([response.data], { type: 'video/mp4' });
                const processedVideoUrl = URL.createObjectURL(processedVideoBlob);
                setProcessedVideo(processedVideoUrl);
            }
            
            if (contentType === 'image/jpeg') {
                const processedImageBlob = new Blob([response.data], { type: 'image/jpeg' });
                const processedImageUrl = URL.createObjectURL(processedImageBlob);
                setProcessedImage(processedImageUrl);
            }
            
        } catch (error) {
            console.error('Error processing image:', error);
        }
    };

    const handleAnyThresholdChange = (fn, thresh, newValue, activeThumb) => {
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
    
    const handleThresholdChange = (event, newValue, activeThumb) => {
        handleAnyThresholdChange(setThreshold, threshold, newValue,  activeThumb);
    };  
    const handleRedThresholdChange = (event, newValue, activeThumb) => {
        handleAnyThresholdChange(setRedThreshold, redThreshold, newValue,  activeThumb);
    }; 
    const handleGreenThresholdChange = (event, newValue, activeThumb) => {
        handleAnyThresholdChange(setGreenThreshold, greenThreshold, newValue,  activeThumb);
    }; 
    const handleBlueThresholdChange = (event, newValue, activeThumb) => {
        handleAnyThresholdChange(setBlueThreshold, blueThreshold, newValue,  activeThumb);
    };  
    
    const applyThreshold = () => {
    
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById('threshold-canvas');
            const ctx = canvas.getContext('2d');
              
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
               
        };
    
        img.src = processedImage;
    }; 

    const handleUploadImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (file.size > 3 * 1024 * 1024) {
          try {
            const resizedBlob = await resizeImage(file);
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

    const resizeImage = (file) => {
        return new Promise((resolve, reject) => {
          Resizer.imageFileResizer(
            file,
            1000,  // New width
            1000 * (file.height / file.width),  // Calculate new height to maintain aspect ratio
            'JPEG',  // Output format (JPEG, PNG, WEBP, etc.)
            100,  // Image quality (0 to 100)
            0,    // Rotation in degrees
            (uri) => {
              const blob = dataURLtoBlob(uri);
              resolve(blob);
            },
            'base64'  // Output type (base64, blob, file)
          );
        });
      };
    
      const dataURLtoBlob = (dataURL) => {
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
    
    const handleClearCanvas = () => {
        drawingAppRef.current.handleClearCanvas(); 
    }
    
    const handleRestart = () => {
        setProcessedImage(originalImage) 
    }
    
    const fileInputRef = React.createRef();
    
    const handleMouseDown = (e) => {
        e.preventDefault();
    };

    const preventImageDrag = (e) => {
      e.preventDefault();
    }; 

    const handleSave = () => {
        window.open(processedImage, '_blank');
    };

    const handlePenSizeChange = (event, newValue, activeThumb) => {
        setPenSize(newValue);
    };
    
    return (
        <TopContainer id="pictor-top-container">
            
            <PenMenu>
                <Compass direction={sortDirection} setDirection={setSortDirection}/>
                <TextField
                    id="direction-select"
                    label="Direction"
                    type="number"
                    value={sortDirection}
                    inputProps={{ min: 0, max: 360 }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={(e) => {
                        const inputValue = e.target.value; 
                        if (inputValue === '') {
                            return
                        }  
                        setSortDirection(inputValue) 
                    }
                    }
                />
                <Slider
                    getAriaLabel={() => 'Pen Size'}
                    orientation="vertical"
                    value={penSize}
                    onChange={handlePenSizeChange} 
                    valueLabelDisplay="auto" 
                    disableSwap 
                    max={150}
                    style={{height:'25vh'}}
                />
                <Button 
                    variant={drawMode==='draw'? "contained" : "outlined"}  
                    onClick={() => {setDrawMode('draw')}}
                    startIcon={<EditIcon />}> 
                    Draw
                </Button>
                <Button 
                    variant={drawMode==='erase' ? "contained" : "outlined"}  
                    onClick={() => {setDrawMode('erase')}}
                    startIcon={<ClearIcon />}>
                    Erase
                </Button> 
                <Button 
                    variant="contained"
                    onClick={handleClearCanvas}
                    startIcon={<RestartAltRoundedIcon />}>
                    Clear Canvas
                </Button>

                <Button 
                    variant={drawMode==='star' ? "contained" : "outlined"}  
                    onClick={() => {setDrawMode('star')}}
                    startIcon={<StarIcon />}>
                    Set Star Center
                </Button> 

            </PenMenu>     
            <div> 
                <div style={{'font-size': 0, position: 'relative', display: 'inline-block' }}> 
                    <Overlay>  
                        <DrawingApp
                            width={imageWidth} 
                            height={imageHeight} 
                            forwardedRef={drawingAppRef} 
                            hidden={!showFilter}   
                            originalImage={processedImage}
                            inFilter={inFilter}
                            initialized={initialized}
                            setInitialized={setInitialized}
                            drawMode={drawMode}
                            penSize={penSize}
                            setStarPoint={setStarPoint}
                        />
                    </Overlay>
                    <StyledImage src={processedImage} alt="Original"        
                    onMouseDown={handleMouseDown}
                    onDragStart={preventImageDrag}/>
                    {showThresh && threshImage && (
                        <img src={threshImage} alt="threshold" style={{ 'pointer-events': 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto' }} />
                    )} 
                </div> 
                
                <ButtonContainer>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group">
                        <Button onClick={handleRestart}>Reset Image</Button>
                        <Button onClick={handlePixelSort}>Pixel Sort</Button>
                        <Button onClick={handleCreateVideo}>Create Video</Button>
                        <Button onClick={handleUploadImage}>Upload Image</Button>
                        <Button onClick={handleSave}>Save Image</Button>
                        
                        <FormControlLabel 
                            control={<Checkbox 
                                    checked={inFilter}
                                    onChange={() => {setInFilter(!inFilter)}} 
                                    />} 
                            label="In Filter"
                        />

                        <FormControlLabel 
                            control={<Checkbox 
                                    checked={blend}
                                    onChange={() => {setBlend(!blend)}} 
                                    />} 
                            label="Blend"
                        />
                        <TextField
                            id="bleed-select"
                            label="Bleed"
                            type="number"
                            value={bleed}
                            inputProps={{ min: 0, max: 999 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => {
                                const inputValue = e.target.value; 
                                if (inputValue === '') {
                                    return
                                }  
                                setBleed(inputValue) 
                            }
                            }
                        />
                        <TextField
                            value={intervalType}
                            onChange={(e) => setIntervalType(e.target.value)}
                            select // tell TextField to render select
                            label="Interval Type"
                            >
                            <MenuItem key={1} value="threshold">
                                Threshold
                            </MenuItem>
                            <MenuItem key={2} value="random">
                                Random
                            </MenuItem>
                            <MenuItem key={3} value="edge">
                                Edge
                            </MenuItem>
                        </TextField>  
                        <div hidden={intervalType !== 'edge'}>
                            <FormControlLabel 
                                control={<Checkbox 
                                        checked={showEdges}
                                        onChange={() => {setShowEdges(!showEdges)}} 
                                        />} 
                                label="Show Edges"
                                
                            />
                        </div>
                    </ButtonGroup>

                    
                    <Slider
                        getAriaLabel={() => 'Minimum distance'}
                        value={threshold}
                        onChange={handleThresholdChange}
                        onChangeCommitted={applyThreshold}
                        valueLabelDisplay="auto" 
                        disableSwap 
                        max={255}
                    />
                    {/** 
                    <div style={{'display': 'flex'}}> 
                        
                        <FormControlLabel 
                            control={<Checkbox 
                                checked={useColorFilter} 
                                onChange={() => {setUseColorFilter(!useColorFilter)}} 
                            />} 
                            label="Color Filter"
                        />

                         
                        <div style={{'display': 'flex', 'flex-direction': 'column', 'width': '-webkit-fill-available', 'width': '-moz-available'}}> 
                            <Slider 
                                getAriaLabel={() => 'Minimum distance'}
                                value={redThreshold}
                                onChange={handleRedThresholdChange}
                                onChangeCommitted={applyThreshold}
                                valueLabelDisplay="auto" 
                                disableSwap 
                                max={255}
                            />
                            <Slider 
                                getAriaLabel={() => 'Minimum distance'}
                                value={greenThreshold}
                                onChange={handleGreenThresholdChange}
                                onChangeCommitted={applyThreshold}
                                valueLabelDisplay="auto" 
                                disableSwap 
                                max={255}
                            />
                            <Slider 
                                getAriaLabel={() => 'Minimum distance'}
                                value={blueThreshold}
                                onChange={handleBlueThresholdChange}
                                onChangeCommitted={applyThreshold}
                                valueLabelDisplay="auto" 
                                disableSwap 
                                max={255}
                            />
                        </div>
                         
                    </div>
                    */}

                    <FormControlLabel 
                    control={<Checkbox 
                            checked={showThresh}
                            onChange={() => {setShowThresh(!showThresh)}} 
                            />} 
                    label="Show affected pixels"
                    />
                    <FormControlLabel 
                    control={<Checkbox 
                            checked={showFilter}
                            onChange={() => {setShowFilter(!showFilter)}} 
                            />} 
                    label="Show filter canvas"
                    />
                    
                    
                    <FileInput
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    
                </ButtonContainer>
                
                <div>
                {processedVideo && <VideoDisplay videoUrl={processedVideo} />}
                </div>
                <canvas id="threshold-canvas" style={{ display: 'none' }}></canvas>
            </div>
        </TopContainer>
    );
}

export default App;
