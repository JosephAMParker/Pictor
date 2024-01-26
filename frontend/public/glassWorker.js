class TupleMap {
    constructor(width) {
        this.map = new Map();
        this.width = width
    }

    set(x, y, value){
        this.map.set(y * this.width + x, value)
        return this
    }

    get(x, y){
        return this.map.get(y * this.width + x)
    }

    has(x, y){
        return this.map.has(y * this.width + x)
    }
}

class CustomImageData {
    constructor(pixelData, x, y, width, height, key){
        this.pixelData = pixelData
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.key = key
    }
}

self.onmessage = function (event) {

    class Component {
        constructor(y, x) {
            this.pixels = [(y, x)];
            
            this.min_x = x;
            this.max_x = x;
            this.min_y = y;
            this.max_y = y;
            this.equalComponents = new Set();
            this.label = componentLabel;
        }

        addPixel(x, y) {
            this.pixels.push((x, y))
            pixel2Label.set(x, y, this.label)
        }

        setMinx(x) {
            this.min_x = Math.min(x, this.min_x)
        }

        setMaxx(x) {
            this.max_x = Math.max(x, this.max_x)
        }

        setMiny(y) {
            this.min_y = Math.min(y, this.min_y)
        }

        setMaxy(y) {
            this.max_y = Math.max(y, this.max_y)
        }
    }

    var data = event.data.data;
    var width = event.data.width;
    var height = event.data.height;
    
    const pixel2Label = new TupleMap(width);
    const label2Component = {} 
    const allComponents = []
    const allLabels = Array.from({ length: height }, () => Array(width).fill(0));
    // const allLabels = Array.from({ length: height }, () => Array(width));
    var componentLabel = 0

    const pixelIsBlack = (y, x) => { 
        return data[(y * width + x) * 4 + 0] === 0 &&
               data[(y * width + x) * 4 + 1] === 0 &&
               data[(y * width + x) * 4 + 2] === 0 
    }  
    const setPixelBlack = (y, x) => { 
        data[(y * width + x) * 4 + 0] = 0 
        data[(y * width + x) * 4 + 1] = 0 
        data[(y * width + x) * 4 + 2] = 0 
        data[(y * width + x) * 4 + 3] = 255
    } 
    const getPixels = (y, x) => {
        return [data[(y * width + x) * 4 + 0],
                data[(y * width + x) * 4 + 1],
                data[(y * width + x) * 4 + 2],
                data[(y * width + x) * 4 + 3]]
    }
    let isBorderComponent = true
    for (let y = 0; y < height; y++) { 
        for (let x = 0; x < width; x++) { 
            //allLabels[y][x] === 0 implies this pixel has not been visited yet
            if (!pixelIsBlack(y, x) && allLabels[y][x] === 0) {  

                const queue = [[y,x]]
                componentLabel += 1
                
                let component
                if(!isBorderComponent){
                    component = new Component(y,x) 
                    allComponents.push(component)
                }
                while (queue.length){

                    const pixel = queue.shift()
                    allLabels[pixel[0]][pixel[1]] = componentLabel 

                    //western neighbor
                    let [_y,_x] = [pixel[0],pixel[1]-1] 
                    if (_y >= 0 && _y < height &&
                        _x >= 0 && _x < width  && 
                        !pixelIsBlack(_y,_x) && allLabels[_y][_x] == 0) {
                        allLabels[_y][_x] = -1
                        queue.push([_y,_x])
                    }
                    //eastern neighbor
                    [_y,_x] = [pixel[0],pixel[1]+1] 
                    if (_y >= 0 && _y < height &&
                        _x >= 0 && _x < width  && 
                        !pixelIsBlack(_y,_x) && allLabels[_y][_x] == 0) {
                        allLabels[_y][_x] = -1
                        queue.push([_y,_x])
                    }
                    //norther neighbor
                    [_y,_x] = [pixel[0]-1,pixel[1]] 
                    if (_y >= 0 && _y < height &&
                        _x >= 0 && _x < width  && 
                        !pixelIsBlack(_y,_x) && allLabels[_y][_x] == 0) {
                        allLabels[_y][_x] = -1
                        queue.push([_y,_x])
                    }
                    //southern neighbor
                    [_y,_x] = [pixel[0]+1,pixel[1]] 
                    if (_y >= 0 && _y < height &&
                        _x >= 0 && _x < width  && 
                        !pixelIsBlack(_y,_x) && allLabels[_y][_x] == 0) {
                        allLabels[_y][_x] = -1
                        queue.push([_y,_x])
                    }

                    [_y,_x] = [pixel[0],pixel[1]]  
                    if(!isBorderComponent){
                        component.setMaxx(_x)
                        component.setMinx(_x)
                        component.setMaxy(_y)
                        component.setMiny(_y) 
                    }
                }
                if(isBorderComponent){ 
                    isBorderComponent = false
                } 

            }  
        }
    }  

    const componentPixelData = []
    for (let c in allComponents) {
        const component = allComponents[c]
        const label = component.label
        const currentComponentData = []; 
        for (let y = component.min_y; y <= component.max_y; y++) { 
            for (let x = component.min_x; x <= component.max_x; x++) {  
                
                if(allLabels[y][x] === label){  
                    currentComponentData.push(...getPixels(y,x)) 
                    setPixelBlack(y,x)
                    
                } else {
                    currentComponentData.push(0,0,0,0) 
                }
                
            }
        }  
        componentPixelData.push(new CustomImageData(
                                Uint8ClampedArray.from(currentComponentData),
                                component.min_x,
                                component.min_y,
                                component.max_x-component.min_x + 1,
                                component.max_y-component.min_y + 1,
                                crypto.randomUUID() 
                                ));

        // componentPixelData.push(new ReturnCanvas(currentComponentData, component.min_x, component.min_y, component.max_x-component.min_x, component.max_y-component.min_y));
    }
    
    self.postMessage({ pixelData:data , componentPixelData});  
}; 


