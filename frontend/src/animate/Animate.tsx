import { styled } from '@mui/material';
import * as React from 'react';

const CanvasDiv = styled('div')({
    pointerEvents: 'none', 
    position: 'absolute',
    top:20,
    left:20,
    zIndex:2
}) 

const AVOID_POINT_DIST = 9000;
const AVOID_POINT_FACTOR = 0.2;
const ATTRACT_POINT_DIST = 30000;
const ATTRACT_POINT_FACTOR = 0.0001;
const AVOID_RANGE = 4000;
const AVOID_FACTOR = 0.001; 
const ALIGNMENT_RANGE = 16000;
const ALIGNMENT_FACTOR = 0.05; 
const COHESION_RANGE = 24000;
const COHESION_FACTOR = 0.0005; 
const EDGE_FACTOR = 0.05;
const MARGIN_EDGE = 200;

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

    constructor(x: number, y:number) {

        this.wingPhase = 0;  
        this.groupID = Math.floor(Math.random() * 2);
        this.x = x;
        this.y = y;
        this.z = 0;
        this.vx = Math.random() * 8 - 4
        this.vy = Math.random() * 8 - 4
        this.vz = Math.random() * 8 - 4
        this.prevVy = this.vz;
        this.ay = 0;
        this.size = 4; 
        this.maxSpeed = 2 + Math.random() * 4; 
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

    seperate(boids:Boid[]) {

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
        if (this.y > window.innerHeight - MARGIN_EDGE * 3){
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
        if(this.ay < 0){
            this.wingPhase -= this.ay * elapsedTime * 1
        }
        if(this.vy < 0){ 
            this.wingPhase -= this.vy * elapsedTime * 0.2
        }
        this.wingPhase += 0.01 * elapsedTime
        this.wingPhase %= (Math.PI * 2)
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

const calculateRotation = (vx: number, vy: number, vz: number) => {
    const radiansToDegrees = 180 / Math.PI;  
    // Calculate rotation around the y-axis (yaw)
    const v = Math.sqrt(vx**2 + vy**2 + vz**2)
    const yaw = Math.asin(vz / v) * radiansToDegrees; 
    // Calculate rotation around the z-axis (roll)
    const roll = Math.atan2(vy, vx) * radiansToDegrees;

    return { y: yaw, z: roll };
};

const mapPhaseValue = (value: number): number => {

    const inMin = 0
    const inMax = 2 * Math.PI

    const outMin = -15
    const outMax = 150 
    
    // Perform linear mapping
    const mappedValue = ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

    // Reverse mapping if the value is in the second half of the output range
    if (mappedValue > (outMin + outMax) / 2) {
        return outMax - (mappedValue - outMin);
    }
    return mappedValue;
};

const NUMBER_OF_BOIDS = 107;

enum FollowMode {
    ONE_GROUP = "ONE_GROUP",
    TWO_GROUPS = "TWO_GROUPS",
    NONE = "NONE"
}

const Animate = () => {   
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const animationRef = React.useRef(0)
    const [boids, setBoids] = React.useState<Boid[]>([]);
    const attractPoints = React.useRef([new FollowPoint(), new FollowPoint()])
    const [followMode, setFollowMode] = React.useState<FollowMode>(FollowMode.ONE_GROUP);
    const [negate, setNegate] = React.useState(1);
    const [avoidPoint, setAvoidPoint] = React.useState<number[]>([]);
    
    React.useEffect(() => { 

        const newboids: Boid[] = []
        for(let i = 0;i<NUMBER_OF_BOIDS;i++){
            newboids.push(new Boid(Math.random() * window.innerWidth, -Math.random() * 200)) 
        }  
        setBoids(newboids) 
        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    
    },[])

    React.useEffect(() => { 

        const drawBoid = (ctx:CanvasRenderingContext2D, boid:Boid) => { 

            const a = (boid.z + 300)/1025
            if(boid.groupID === 0){
                ctx.fillStyle = `rgba(8, 8, 90, ${a})`
            } else {
                ctx.fillStyle = `rgba(200, 80, 17, ${a})`
            }
            ctx.fillStyle = `rgba(8, 8, 17, ${a})`
            ctx.save();  
           
            const rotation = calculateRotation(boid.vx, boid.vy, boid.vz); 
            const zsize = Math.max((boid.z + 100)/1000, 1)   

            //draw wings
            const wing = [9,9]
            const bodyWidth = 1
            // draw right wing   
            ctx.setTransform(new DOMMatrix()
                .translateSelf(boid.x + boid.size/2, boid.y + boid.size/2) 
                .rotateSelf(-mapPhaseValue(boid.wingPhase), rotation.y, rotation.z)
                .scaleSelf(zsize)
            ); 
            
            ctx.beginPath();  
            ctx.lineTo(-wing[0] - 3, wing[1])
            ctx.lineTo(-wing[0], bodyWidth) 
            ctx.lineTo(0, bodyWidth) 
            ctx.closePath();
            ctx.fill(); 

            // draw left wing   
            ctx.setTransform(new DOMMatrix()
                .translateSelf(boid.x + boid.size/2, boid.y + boid.size/2) 
                .rotateSelf(mapPhaseValue(boid.wingPhase), rotation.y, rotation.z)
                .scaleSelf(zsize)
            );
            
            ctx.beginPath();  
            ctx.lineTo(-wing[0] - 3, -wing[1])
            ctx.lineTo(-wing[0], -bodyWidth) 
            ctx.lineTo(0, -bodyWidth) 
            ctx.closePath();
            ctx.fill(); 

            // draw body profile 
            ctx.setTransform(new DOMMatrix()
                .translateSelf(boid.x + boid.size/2, boid.y + boid.size/2) 
                .rotateSelf(0,rotation.y,rotation.z)
                .scaleSelf(zsize)
            );  
            
            ctx.beginPath();  
            ctx.lineTo(-6,  2);
            ctx.lineTo(-3,  2);
            ctx.lineTo( 2,  0); //beak
            ctx.lineTo(-3, -2);
            ctx.lineTo(-6, -2);
            ctx.lineTo(-19, 0); //tail
            ctx.closePath();
            ctx.fill();  
            
            ctx.restore();
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx && canvas){ 
        
            const animate = (time:number, prevTime:number) => {

                const elapsedTime = (time - prevTime) / 17

                if (document.hidden) {
                    animationRef.current = requestAnimationFrame((t) => animate(t, time));
                    return
                }
                
                ctx.clearRect(0, 0, canvas.width, canvas.height); 

                boids.sort((a, b) => a.z - b.z);

                for (const p in attractPoints.current){
                    const point = attractPoints.current[p]
                    point.move();
                    // ctx.beginPath();  
                    // ctx.arc(point.p[0], point.p[1], 15, 0, Math.PI * 2)
                    // ctx.fill(); 
                }
                

                for (const b in boids){
                    
                    const boid = boids[b] 
                    boid.seperate(boids); 
                    boid.alignment(boids); 
                    boid.cohesion(boids, negate);
                    boid.clampSpeed();
                    boid.checkEdges();
                    boid.avoidPoint(avoidPoint);
                    if(followMode === FollowMode.ONE_GROUP){
                        boid.attractPoint(attractPoints.current[0]);
                    }
                    if(followMode === FollowMode.TWO_GROUPS){
                        boid.attractPoint(attractPoints.current[boid.groupID]);
                    }
                    boid.move(elapsedTime);
                    boid.calcYAcc();
                    boid.calcWingPhase(elapsedTime);
                    drawBoid(ctx, boid);
                }
                
            
                // Request the next animation frame
                animationRef.current = requestAnimationFrame((t) => animate(t, time));
            };
        
            animate(performance.now(), performance.now()); // Start the animation loop
        }

        const handleMouseDown = (event: MouseEvent) => {
            if (!(event.buttons === 1)) return;
            setAvoidPoint([event.x, event.y]) 
        }
        const handleMouseUp = () => {
            setAvoidPoint([]) 
        }

        document.addEventListener('mousedown', handleMouseDown);
        // document.addEventListener('mousemove', handleMouseDown);
        document.addEventListener('mouseleave', handleMouseUp);
        document.addEventListener('mouseup', handleMouseUp);

    
        // Cleanup function
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            // document.removeEventListener('mousemove', handleMouseDown); 
            document.removeEventListener('mouseleave', handleMouseUp);
            document.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationRef.current);
        };

      }, [boids, avoidPoint, setAvoidPoint, attractPoints, followMode, negate]);
    
    return (  
        <CanvasDiv id="animate-div">
            <canvas ref={canvasRef} width={window.innerWidth - 40} height={window.innerHeight - 40}></canvas>
        </CanvasDiv> 
    );
};

export default Animate;

