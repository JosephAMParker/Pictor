import * as React from 'react';
import { styled } from '@mui/material';    
import { Application, Assets, Sprite, Texture, Ticker } from 'pixi.js';
import { START_NUMBER_OF_BOIDS } from '../Constants';

const ContainerDiv = styled('div')({
    pointerEvents: 'none', 
    position: 'absolute',
    width: 'calc(100% - 40px)',  
    height: 'calc(100% - 40px)',
    top:20,
    left:20,
    zIndex:2
})  

const AVOID_POINT_DIST = 9000;
const AVOID_POINT_FACTOR = 0.2;
const ATTRACT_POINT_DIST = 30000;
const ATTRACT_POINT_FACTOR = 0.00005;
const AVOID_RANGE = 4000;
const AVOID_FACTOR = 0.002; 
const ALIGNMENT_RANGE = 16000;
const ALIGNMENT_FACTOR = 0.05; 
const COHESION_RANGE = 24000;
const COHESION_FACTOR = 0.0005; 
const EDGE_FACTOR = 0.05;
const MARGIN_EDGE = 200;

const GRID_OUTSIDE = 'outside';

class Boid { 

    groupID:number

    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    prevVy: number;
    ay: number;
    size: number;
    maxSpeed: number;
    wingPhase:number;  
    gridKey:string;

    ySine: number;
    xSine: number;
    zSine: number;

    body:Sprite; 

    constructor(x: number, y:number, body:Texture) {
        this.body = new Sprite(body); 
        this.body.anchor.set(0.5); 
        this.wingPhase = 0;  
        this.groupID = Math.floor(Math.random() * 2);
        this.x = x;
        this.y = y;
        this.z = Math.random() * 1000 - 500;
        this.vx =  Math.random() * 8 - 4
        this.vy =  Math.random() * 8 - 4
        this.vz =  Math.random() * 8 - 4
        this.prevVy = this.vz;
        this.ay = 0;
        this.size = 4; 
        this.maxSpeed = 2 + Math.random() * 4; 

        this.ySine = 0;
        this.xSine = 0;
        this.zSine = 0;

        this.gridKey = GRID_OUTSIDE
    }

    move(elapsedTime:number) {
        this.x += this.vx * elapsedTime
        this.y += this.vy * elapsedTime
        this.z += this.vz * elapsedTime
    }

    clampSpeed() {
        this.vx = Math.max(Math.min(this.vx, this.maxSpeed), -this.maxSpeed);
        this.vy = Math.max(Math.min(this.vy, this.maxSpeed), -this.maxSpeed);
        this.vz = Math.max(Math.min(this.vz, this.maxSpeed), -this.maxSpeed);
    }

    dist2Boid(boid:Boid){
        return (this.x - boid.x)**2 + (this.y - boid.y)**2 + (this.z - boid.z)**2
    }

    dist2Point(p:number[]){
        return (this.x - p[0])**2 + (this.y - p[1])**2
    }

    separate(boids:Boid[]) {

        let sep_dx = 0;
        let sep_dy = 0;
        let sep_dz = 0;

        for (const b in boids){
            const boid = boids[b]
            if (boid !== this && this.dist2Boid(boid) < AVOID_RANGE){
                sep_dx += this.x - boid.x
                sep_dy += this.y - boid.y
                sep_dz += this.z - boid.z
            }
        }

        this.vx += sep_dx * AVOID_FACTOR
        this.vy += sep_dy * AVOID_FACTOR
        this.vz += sep_dz * AVOID_FACTOR

    }

    alignment(boids:Boid[]) {

        let xvel_avg = 0
        let yvel_avg = 0
        let zvel_avg = 0
        let neighboring_boids = 0

        for (const b in boids){
            const boid = boids[b]
            if (boid !== this && this.dist2Boid(boid) < ALIGNMENT_RANGE){
                xvel_avg += boid.vx
                yvel_avg += boid.vy
                zvel_avg += boid.vz
                neighboring_boids += 1
            }
        }

        if (neighboring_boids > 0){
            xvel_avg = xvel_avg/neighboring_boids
            yvel_avg = yvel_avg/neighboring_boids
            zvel_avg = zvel_avg/neighboring_boids

            this.vx += (xvel_avg - this.vx)*ALIGNMENT_FACTOR
            this.vy += (yvel_avg - this.vy)*ALIGNMENT_FACTOR
            this.vz += (zvel_avg - this.vz)*ALIGNMENT_FACTOR
        }

    }

    cohesion(boids:Boid[], negate:number) {

        let xpos_avg = 0
        let ypos_avg = 0
        let zpos_avg = 0
        let neighboring_boids = 0

        for (const b in boids){
            const boid = boids[b]
            if (boid !== this && this.dist2Boid(boid) < COHESION_RANGE){
                xpos_avg += boid.x
                ypos_avg += boid.y
                zpos_avg += boid.z
                neighboring_boids += 1
            }
        }

        if (neighboring_boids > 0){
            xpos_avg = xpos_avg/neighboring_boids
            ypos_avg = ypos_avg/neighboring_boids
            zpos_avg = zpos_avg/neighboring_boids

            this.vx += (xpos_avg - this.x)*COHESION_FACTOR*negate
            this.vy += (ypos_avg - this.y)*COHESION_FACTOR*negate
            this.vz += (zpos_avg - this.z)*COHESION_FACTOR*negate
        }

    }

    checkEdges() { 
        if (this.y > window.innerHeight - MARGIN_EDGE * 2){
            this.vy -= EDGE_FACTOR
        }
        if (this.y < MARGIN_EDGE){
            this.vy += EDGE_FACTOR
        }
        if (this.z > 1025){
            this.vz -= EDGE_FACTOR
        }
        if (this.z < 500){
            this.vz += EDGE_FACTOR
        }
        if (this.z < 0) {
            this.z = 1
        }
        const e = 25
        if (this.x > window.innerWidth + e){
            this.x = -e/2
        }
        if (this.x < -e){
            this.x = (window.innerWidth + e/2)
        }
    }

    avoidPoint(p:number[]){
        if(!p){
            return
        }

        if (this.dist2Point(p) < AVOID_POINT_DIST){
            this.vy += (this.y - p[1]) * AVOID_POINT_FACTOR
            this.vx += (this.x - p[0]) * AVOID_POINT_FACTOR 
        }
    }

    attractPoint(fp: FollowPoint | null){
        if(!fp){
            return
        }
        if (this.dist2Point(fp.p) > ATTRACT_POINT_DIST){
            this.vx += (fp.p[0] - this.x) * ATTRACT_POINT_FACTOR 
            this.vy += (fp.p[1] - this.y) * ATTRACT_POINT_FACTOR
            
        }
    }

    calcYAcc() { 
        this.ay = this.vy - this.prevVy
        this.prevVy = this.vy 
    }

    calcWingPhase(elapsedTime: number) {
        if(this.vy > 0 && this.wingPhase < 8){
            this.wingPhase += 0.1 * elapsedTime
            return
        }
        if (this.ay < 0){
            this.wingPhase += 0.2 * elapsedTime  
        } 
        if(this.vy < 0){
            this.wingPhase -= this.vy * elapsedTime * 0.2
        }
        this.wingPhase %= (12)
    }

    calcWingPhase2(elapsedTime: number) { 
        if(this.ay < 0){
            this.wingPhase -= this.ay * elapsedTime * 1
        }
        if(this.vy < 0){ 
            this.wingPhase -= this.vy * elapsedTime * 0.2
        }
        this.wingPhase += 0.1 * elapsedTime
        this.wingPhase %= (12)
    } 

    limitVy(): void {

        const maxVerticalRatio = 0.6;
        // Calculate the squared magnitude of the velocity vector (squared sum of squares)
        const magnitude = Math.sqrt(this.vx ** 2 + this.vy ** 2 + this.vz ** 2);

        // Check if the squared vertical velocity (vy) exceeds the squared magnitude multiplied by the threshold 
        if (Math.abs(this.vy) > magnitude * maxVerticalRatio) {
            // Adjust vy to ensure it doesn't exceed the threshold
            if(this.vy > 0){
                this.vy = magnitude * maxVerticalRatio
            } else {
                this.vy = -magnitude * maxVerticalRatio
            }
        }
    }
  }

class FollowPoint {

    p: number[];  
    v: number[]; 

    constructor() {
        this.p = [Math.random() * window.innerWidth/2+100, Math.random() * window.innerHeight/2+100] 
        this.v = [Math.random() * 1 + 0.5, Math.random() * 1 + 0.5] 
    }

    move() {
        this.p[0] += this.v[0]
        this.p[1] += this.v[1]

        if(this.p[0] < 100 || this.p[0] > window.innerWidth - 100){
            this.v[0] *= -1
        }

        if(this.p[1] < 100 || this.p[1] > window.innerHeight - 100){
            this.v[1] *= -1
        }
    }
}

class BoidGrid {

    squares: { [key: string]: Set<Boid> } = {};
    gridSize: number
    xSize: number
    ySize: number 
    width: number
    height: number

    // Initialize grid with appropriate dimensions
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.gridSize = 3
        this.xSize = this.width  / this.gridSize
        this.ySize = this.height / this.gridSize
        this.reset()
    }

    reset() {
        this.width = window.innerWidth;
        this.height = window.innerHeight; 
        this.xSize = this.width  / this.gridSize
        this.ySize = this.height / this.gridSize
        for (let x = 0; x < this.width; x += this.xSize) {
            for (let y = 0; y < this.height; y += this.ySize) {
                const key = this.gridKey(x,y)
                this.squares[key] = new Set();
            }
        }

        this.squares[GRID_OUTSIDE] = new Set();
    }

    gridKey(x: number, y: number){
        if (x < 0 || x > this.width)
            return GRID_OUTSIDE
        if (y < 0 || y > this.height)
            return GRID_OUTSIDE
        return `${Math.floor(x / this.xSize)}-${Math.floor(y / this.ySize)}`;
    }

    // Assign boid to grid square
    assignBoid(boid: Boid) {
        const x = boid.x
        const y = boid.y;
        const key = this.gridKey(x,y)
        this.squares[key].add(boid);
    }

    // Update boid position and grid assignment
    updateBoid(boid: Boid) {
        const x = boid.x
        const y = boid.y;
        const currentKey = this.gridKey(x,y)

        // Check if the boid has moved to a new grid square
        if (boid.gridKey !== currentKey) {
            // Remove the boid from its previous grid square
            const previousKey = boid.gridKey;
            this.squares[previousKey].delete(boid);

            // Update the boid's grid assignment
            boid.gridKey = currentKey;

            // Assign the boid to the new grid square
            this.squares[currentKey].add(boid);
        }
    }

    // Get neighboring boids for a given boid
    getNeighborBoids(boid: Boid): Boid[] {
        const x = boid.x
        const y = boid.y;

        // const neighboringCoordinates = [
        //                         { dx: 0, dy: -this.ySize },  
        //     { dx: -this.xSize, dy: 0 },                     { dx: this.xSize, dy: 0 },
        //                         { dx: 0, dy: this.ySize },  
        // ];

        const neighboringCoordinates = [
            { dx: -this.xSize, dy: -this.ySize }, { dx: 0, dy: -this.ySize }, { dx: -this.xSize, dy: -this.ySize },
            { dx: -this.xSize, dy: 0 },                                       { dx: this.xSize, dy: 0 },
            { dx: -this.xSize, dy: this.ySize },  { dx: 0, dy: this.ySize },  { dx: this.xSize, dy: this.ySize } 
        ];
        const neighboringBoids = boid.gridKey !== GRID_OUTSIDE ? Array.from(this.squares[boid.gridKey]) : []
        for (const { dx, dy } of neighboringCoordinates) {
            const key = this.gridKey(x+dx,y+dy)
            if (key !== GRID_OUTSIDE){  
                neighboringBoids.concat(Array.from(this.squares[key]))
            }
        } 
        return neighboringBoids;
    }

}

const calculateRotation = (vx: number, vy: number, vz: number) => {
    
    const v = Math.sqrt(vx**2 + vy**2 + vz**2)
    // Calculate rotation around the y-axis (yaw)
    const yaw = Math.asin(vz / v) ; 
    // Calculate rotation around the z-axis (roll)
    const roll = Math.atan2(vy, vx) ;
    // Calculate rotation around the x-axis (pitch)
    const pitch = Math.atan2(Math.sqrt(vx**2 + vy**2), vz);

    return { x: pitch, y: yaw, z: roll };
};  

enum FollowMode {
    ONE_GROUP = "ONE_GROUP",
    TWO_GROUPS = "TWO_GROUPS",
    NONE = "NONE"
}

type CroidsProps = {
    numberOfBoids: number
}

const Croids = (props:CroidsProps) => {    
    
    const [boids, setBoids] = React.useState<Boid[]>([]);
    const attractPoints = React.useRef([new FollowPoint(), new FollowPoint()])
    const [followMode, setFollowMode] = React.useState<FollowMode>(FollowMode.NONE);
    const [negate, setNegate] = React.useState(1);
    const [avoidPoint, setAvoidPoint] = React.useState<number[]>([]); 
    const { numberOfBoids } = props;
    const pixiContainerRef = React.useRef<HTMLDivElement>(null); 
    const app = React.useRef<Application>(new Application()); 
    const grid = React.useRef<BoidGrid>(new BoidGrid());

    React.useEffect(() => {
        if (numberOfBoids < boids.length){
            setBoids(boi => boi.slice(0, numberOfBoids))
            return
        }
        if (numberOfBoids > boids.length){
            const diff = numberOfBoids - boids.length
            const newBoids: Boid[] = []
            
            for(let i = 0;i<diff;i++){  
                const boid = new Boid(window.innerWidth * Math.random(), window.innerHeight + Math.random() * window.innerHeight, Texture.from("croid_x30_z80.png0007.png"))
                newBoids.push(boid) 
            }
            setBoids(boi => [...boi, ...newBoids]);
        }
    }, [numberOfBoids, boids.length])

    React.useEffect(() => {
        app.current.stage.removeChildren()
        grid.current.reset()
        for (const b in boids){
            const boid = boids[b] 
            app.current.stage.addChild(boid.body); 
            grid.current.assignBoid(boid)
        }
    }, [boids])

    React.useEffect(() => {

        const appNow = app.current
        const initPixi = async () => { 

            // init PixiJS put to container and load assets 
            const croidsCanvas = document.getElementById('croids-canvas')
            if(croidsCanvas)
                await app.current.init({ antialias: true, resizeTo: croidsCanvas, backgroundAlpha: 0, autoDensity:true}); 
                
            pixiContainerRef.current?.appendChild(app.current.canvas);   
            await Assets.load(process.env.PUBLIC_URL + '/croids/croids.json');  

            // init boids
            const newBoids: Boid[] = []
            for(let i = 0;i<START_NUMBER_OF_BOIDS;i++){  
                const boid = new Boid(window.innerWidth * Math.random(), window.innerHeight + Math.random() * window.innerHeight, Texture.from("croid_x30_z80.png0007.png"))
                // app.current.stage.addChild(boid.body); 
                newBoids.push(boid)
            }   

            setBoids(newBoids)
        }
        const handleMouseDown = (event: MouseEvent) => {
            if (!(event.buttons === 1)) return;
            const scrollX = document.documentElement.scrollLeft;
            const scrollY = document.documentElement.scrollTop;
            setAvoidPoint([event.clientX + scrollX, event.clientY + scrollY]); 
        } 

        const handleMouseUp = () => {
            setAvoidPoint([]) 
        }    

        document.addEventListener('mousedown', handleMouseDown); 
        document.addEventListener('mouseleave', handleMouseUp);
        document.addEventListener('mouseup', handleMouseUp);

        initPixi()

        // Clean up function 
        return () => { 
            document.removeEventListener('mousedown', handleMouseDown); 
            document.removeEventListener('mouseleave', handleMouseUp);
            document.removeEventListener('mouseup', handleMouseUp);
            appNow.destroy(true);
        }; 
        
    },[]) 

    React.useEffect(() => { 

        const appNow = app.current

        const tickFn = (tick:Ticker) => {

            if (tick.FPS < 45)
                console.log(tick.FPS)

            for (const p in attractPoints.current){
                const point = attractPoints.current[p]
                point.move(); 
            }

            for (const b in boids){ 
                const boid = boids[b]  
                const nearBoids = grid.current.getNeighborBoids(boid);
                boid.separate(nearBoids); 
                boid.alignment(nearBoids); 
                boid.cohesion(nearBoids, negate);
                boid.clampSpeed();
                boid.checkEdges();
                boid.avoidPoint(avoidPoint);
                if(followMode === FollowMode.ONE_GROUP){
                    boid.attractPoint(attractPoints.current[0]);
                }
                if(followMode === FollowMode.TWO_GROUPS){
                    boid.attractPoint(attractPoints.current[boid.groupID]);
                }
                boid.move(tick.deltaTime);
                boid.calcYAcc();
                boid.calcWingPhase(tick.deltaTime);

                boid.limitVy();   
                
                grid.current.updateBoid(boid)

                boid.body.x = boid.x
                boid.body.y = boid.y  

                const rotation = calculateRotation(boid.vx, boid.vy, boid.vz); 
                const zSize = Math.max((boid.z + 100)/1000, 0.1) + 0.2 
                boid.body.scale = zSize
                const toDegrees = 180 / Math.PI 
                const wingPhase = Math.floor(boid.wingPhase).toString().padStart(2, '0');
                let zVal = rotation.y * toDegrees
                zVal = Math.ceil(zVal / 10) * 10;

                let xVal = rotation.z * toDegrees
                xVal = Math.ceil(xVal / 10) * 10+10;

                if (xVal > 30){
                    xVal = 30
                } else if (xVal < -30){
                    xVal = -30
                } 
                boid.body.texture = Texture.from(`croid_x${xVal}_z${zVal}.png00${wingPhase}.png`)
                if (boid.vx  > 0){
                    boid.body.scale.x *= -1;
                } 
            }
        }

        if (appNow.ticker){ 
            appNow.ticker.add(tickFn, this)   
        }

        return () => {  
            if(appNow.ticker){
                appNow.ticker.remove(tickFn, this)
            }
        };

    },[boids, avoidPoint, attractPoints, followMode, negate])  

    return (    
        <ContainerDiv id="croids-canvas" ref={pixiContainerRef}></ContainerDiv> 
    );
};

export default Croids; 

