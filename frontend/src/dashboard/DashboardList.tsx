import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';
import ListItemIcon from '@mui/material/ListItemIcon'; 
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import EditIcon from '@mui/icons-material/Edit';  
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ViewArrayIcon from '@mui/icons-material/ViewArray';
import { ExpandLess, ExpandMore, StarBorder, Star, BlurLinear} from '@mui/icons-material';
import { Collapse, Divider, ListItem, Slider } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import UTurnRightIcon from '@mui/icons-material/UTurnRight';
import LooksIcon from '@mui/icons-material/Looks';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';

type DashboardListProps = {
    handleUploadImage: () => void;
    handlePixelSort: () => void;
    handleClearCanvas: () => void;
    imageWidth: number
    disableSort: boolean
    useMask: boolean
    setUseMask: React.Dispatch<React.SetStateAction<boolean>> 
    drawMode: string
    setDrawMode: React.Dispatch<React.SetStateAction<string>> 
    penSize: number
    setPenSize: React.Dispatch<React.SetStateAction<number>> 
    inFilter: boolean
    setInFilter: React.Dispatch<React.SetStateAction<boolean>> 
    blend: boolean
    setBlend: React.Dispatch<React.SetStateAction<boolean>> 
    showThresh: boolean
    setShowThresh: React.Dispatch<React.SetStateAction<boolean>> 
    useStar:boolean
    setUseStar: React.Dispatch<React.SetStateAction<boolean>> 
    intervalType:string 
    setIntervalType: React.Dispatch<React.SetStateAction<string>> 
    pathType:string 
    setPathType: React.Dispatch<React.SetStateAction<string>> 
    pathAmp:number
    setPathAmp:React.Dispatch<React.SetStateAction<number>> 
    pathX:number
    setPathX:React.Dispatch<React.SetStateAction<number>> 
    pathFreq:number
    setPathFreq:React.Dispatch<React.SetStateAction<number>> 
    showGraph:boolean
    setShowGraph:React.Dispatch<React.SetStateAction<boolean>>  
};

export default function DashboardList(props:DashboardListProps){ 
 
    const { imageWidth, disableSort, pathFreq, setShowGraph, showGraph, setPathFreq, pathX, setPathX, pathAmp, setPathAmp, pathType, setPathType, intervalType, setIntervalType, useStar, setUseStar, showThresh, setShowThresh, blend, setBlend, inFilter, setInFilter, penSize, setPenSize, drawMode, setDrawMode, useMask, setUseMask, handlePixelSort, handleClearCanvas } = props;

    const [openStar, setOpenStar] = React.useState(false)
    const [openMask, setOpenMask] = React.useState(false) 
    const [openInterval, setOpenInterval] = React.useState(false) 
    const [openPathType, setOpenPathType] = React.useState(false)  
    const [openPathSettings, setOpenPathSettings] = React.useState(false)   

    return (
        <List component="nav">  

            <ListItemButton  
                disabled={disableSort}          
                onClick={() => {
                    handlePixelSort() 
                }}> 
            <ListItemIcon>
                <BlurLinear />
            </ListItemIcon>
            <ListItemText primary="Sort" />
            </ListItemButton>  

            <Divider />

            <ListItemButton 
                onClick={() => setShowThresh(!showThresh)} 
                selected={showThresh }>
                <ListItemIcon> 
                    {!showThresh && <CheckBoxOutlineBlankIcon />}
                    {showThresh && <CheckBoxIcon />}
                </ListItemIcon>
                <ListItemText primary="Show Affected Pixels" />
            </ListItemButton>

            <ListItemButton 
                onClick={() => setOpenMask(!openMask)} 
                selected={useMask}>
                <ListItemIcon>
                    {!useMask && <CheckBoxOutlineBlankIcon />}
                    {useMask && <CheckBoxIcon />}
                </ListItemIcon>
                <ListItemText primary={"Masking"} />
                {openMask ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openMask} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                    <ListItemButton 
                        onClick={() => setUseMask(!useMask)} 
                        sx={{ pl: 4 }}>
                        <ListItemIcon> 
                            {!useMask && <CheckBoxOutlineBlankIcon />}
                            {useMask && <CheckBoxIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Use Mask" />
                    </ListItemButton>

                    <ListItemButton 
                        disabled={!useMask}
                        sx={{ pl: 4 }} 
                        selected={drawMode==='draw'}
                        onClick={() => {
                            setDrawMode('draw')
                        }}
                        > 
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText primary="Draw" />
                    </ListItemButton>

                    <ListItemButton 
                        disabled={!useMask}
                        sx={{ pl: 4 }}
                        selected={drawMode==='erase'}
                        onClick={() => {
                            setDrawMode('erase')
                        }}
                        >
                        <ListItemIcon>
                            <ViewArrayIcon />
                        </ListItemIcon>
                        <ListItemText primary="Erase" />
                    </ListItemButton>

                    <ListItemButton
                        disabled={!useMask}
                        onClick={handleClearCanvas} 
                        sx={{ pl: 4 }}>
                        <ListItemIcon>
                            <RestartAltRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Clear" />
                    </ListItemButton>

                    <ListItemButton 
                        disabled={!useMask}
                        onClick={() => setInFilter(!inFilter)} 
                        sx={{ pl: 4 }}>
                        <ListItemIcon> 
                            {!inFilter && <CheckBoxOutlineBlankIcon />}
                            {inFilter && <CheckBoxIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Invert Mask" />
                    </ListItemButton>

                    <ListItemButton 
                        disabled={!useMask}
                        onClick={() => setBlend(!blend)} 
                        sx={{ pl: 4 }}>
                        <ListItemIcon> 
                            {!blend && <CheckBoxOutlineBlankIcon />}
                            {blend && <CheckBoxIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Blur Mask" />
                    </ListItemButton>

                    <ListItem>
                        <ListItemText primary="Pen Size" sx={{ textAlign: 'center' }}/> 
                    </ListItem>
                    
                    <ListItem> 
                        <Slider
                            getAriaLabel={() => 'Pen Size'} 
                            value={penSize}
                            onChange={(e, newValue, a) => {
                                setPenSize(newValue as number);
                            }} 
                            valueLabelDisplay="auto" 
                            disableSwap 
                            max={150}
                            style={{'margin':'4px'}}
                        /> 
                    </ListItem>  
                </List>
            </Collapse>  

            <ListItemButton onClick={() => {setOpenInterval(!openInterval)}}>
                <ListItemIcon> 
                    <DensityMediumIcon /> 
                </ListItemIcon>
                <ListItemText 
                sx={{textTransform: 'capitalize'}}
                primary={"Interval Type — " + intervalType} />
                {openInterval ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openInterval} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={intervalType==='threshold'}
                        onClick={() => {
                            setIntervalType('threshold')
                        }}
                        > 
 
                        <ListItemText primary="Threshold" />
                    </ListItemButton>

                    <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={intervalType==='edge'}
                        onClick={() => {
                            setIntervalType('edge')
                        }}
                        > 
 
                        <ListItemText primary="Edge" />
                    </ListItemButton>

                    <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={intervalType==='random'}
                        onClick={() => {
                            setIntervalType('random')
                        }}
                        > 
 
                        <ListItemText primary="Random" />
                    </ListItemButton>

                </List>
            </Collapse>

            <ListItemButton onClick={() => {setOpenPathType(!openPathType)}}>
                <ListItemIcon> 
                    {pathType === 'line' && <ArrowRightAltIcon />}
                    {pathType === 'curve' && <UTurnRightIcon/>}
                    {pathType === 'circle' && <LooksIcon/>}
                    {pathType === 'sine' && <AirlineStopsIcon />} 
                </ListItemIcon>
                <ListItemText 
                sx={{textTransform: 'capitalize'}}
                primary={"Path Type — " + pathType} />
                {openPathType ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openPathType} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                    <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={pathType==='line'}
                        onClick={() => {
                            setPathType('line')
                        }}
                        > 
 
                        <ListItemText primary="Line" />
                    </ListItemButton>

                    <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={pathType==='sine'}
                        onClick={() => {
                            setPathType('sine')
                        }}
                        > 
 
                        <ListItemText primary="Sine" />
                    </ListItemButton>

                    <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={pathType==='curve'}
                        onClick={() => {
                            setPathType('curve')
                        }}
                        > 
 
                        <ListItemText primary="Curve" />
                    </ListItemButton>

                    <ListItemButton  
                        sx={{ pl: 8 }} 
                        selected={pathType==='circle'}
                        onClick={() => {
                            setPathType('circle')
                        }}
                        > 
 
                        <ListItemText primary="Circle" />
                    </ListItemButton>

                </List>
            </Collapse>

            <ListItemButton onClick={() => {setOpenPathSettings(!openPathSettings)}}>
                <ListItemIcon> 
                    <SortIcon /> 
                </ListItemIcon>
                <ListItemText 
                sx={{textTransform: 'capitalize'}}
                primary={"Path Settings"} />
                {openPathSettings ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openPathSettings} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                    <ListItemButton 
                        onClick={() => 
                           {setShowGraph(!showGraph)}
                        } 
                        sx={{ pl: 4 }}>
                        <ListItemIcon> 
                            {!showGraph && <CheckBoxOutlineBlankIcon />}
                            {showGraph && <CheckBoxIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Show Graph" />
                    </ListItemButton>

                    <ListItem> 
                        <ListItemText primary="Amp" sx={{ textAlign: 'left', width:'70px'  }}/> 
                        <Slider
                            getAriaLabel={() => 'Amplitude'} 
                            value={pathAmp}
                            onChange={(e, newValue, a) => {
                                setPathAmp(newValue as number);
                            }} 
                            valueLabelDisplay="auto"  
                            max={imageWidth}
                            min={1}
                            style={{'margin':'4px'}}
                        /> 
                    </ListItem> 

                    <ListItem> 
                        <ListItemText primary="Pos" sx={{ textAlign: 'left', width:'70px'  }}/>
                        <Slider
                            getAriaLabel={() => 'X Pos'} 
                            value={pathX}
                            onChange={(e, newValue, a) => {
                                setPathX(newValue as number);
                            }} 
                            valueLabelDisplay="auto"  
                            max={imageWidth}
                            style={{'margin':'4px'}}
                        /> 
                    </ListItem>

                    {pathType==='sine' && 
                        <ListItem> 
                            <ListItemText primary="Freq" sx={{ textAlign: 'left', width:'68px' }}/>
                            <Slider
                                getAriaLabel={() => 'Freq'} 
                                value={pathFreq}
                                onChange={(e, newValue, a) => {
                                    setPathFreq(newValue as number);
                                }} 
                                valueLabelDisplay="auto"  
                                max={180}
                                min={1}
                                style={{'margin':'4px'}}
                            /> 
                        </ListItem>
                    }

                </List>
            </Collapse>

            <ListItemButton onClick={() => {setOpenStar(!openStar)}}
                selected={useStar}
                > 
                <ListItemIcon> 
                     {!useStar && <StarBorder />}
                     {useStar && <Star />}
                </ListItemIcon>
                <ListItemText primary={"Star"} />
                {openStar ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openStar} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>

                    <ListItemButton 
                        onClick={() => 
                           {setUseStar(!useStar)
                            setDrawMode('draw')}
                        } 
                        sx={{ pl: 4 }}>
                        <ListItemIcon> 
                            {!useStar && <CheckBoxOutlineBlankIcon />}
                            {useStar && <CheckBoxIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Use Star" />
                    </ListItemButton>

                    <ListItemButton 
                        disabled={!useStar}
                        sx={{ pl: 4 }} 
                        selected={drawMode==='star'}
                        onClick={() => {
                            setDrawMode('star')
                        }}
                        > 
                        <ListItemIcon>
                            <Star/>
                        </ListItemIcon>
                        <ListItemText primary="Place Star Center" />
                    </ListItemButton>

                </List>
            </Collapse>
        </List>
    )

} 