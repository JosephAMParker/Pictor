import { styled } from '@mui/material';
import * as React from 'react';

const CanvasDiv = styled('div')({
    pointerEvents: 'none', 
    position: 'absolute',
    top:20,
    left:20,
    zIndex:2
}) 

class Boid { 

    test1:number;
    test2:number;

    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    size: number;
    maxSpeed: number;

    avoidRange: number;
    avoidFactor: number;
    alignmentRange:number;
    alignmentFactor:number;
    cohesionRange:number;
    cohesionFactor:number;
    edgeFactor:number;
    marginEdge:number;

    constructor(x: number, y:number, size:number) {

        this.test1 = 0;
        this.test2 = 0;

        this.x = x;
        this.y = y;
        this.z = 0;
        this.vx = Math.random() * 8 - 4
        this.vy = Math.random() * 8 - 4
        this.vz = Math.random() * 8 - 4
        this.size = size; 
        this.maxSpeed = 2 + Math.random() * 4;

        this.avoidRange = 4000;
        this.avoidFactor = 0.001;

        this.alignmentRange = 16000;
        this.alignmentFactor = 0.05;

        this.cohesionRange = 24000;
        this.cohesionFactor = 0.0005;

        this.edgeFactor = 0.05
        this.marginEdge = 200;
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

    seperate(boids:Boid[]) {

        let sep_dx = 0;
        let sep_dy = 0;
        let sep_dz = 0;

        for (const b in boids){
            const boid = boids[b]
            if (boid !== this && this.dist2Boid(boid) < this.avoidRange){
                sep_dx += this.x - boid.x
                sep_dy += this.y - boid.y
                sep_dz += this.z - boid.z
            }
        }

        this.vx += sep_dx * this.avoidFactor
        this.vy += sep_dy * this.avoidFactor
        this.vz += sep_dz * this.avoidFactor

    }

    alignment(boids:Boid[]) {

        let xvel_avg = 0
        let yvel_avg = 0
        let zvel_avg = 0
        let neighboring_boids = 0

        for (const b in boids){
            const boid = boids[b]
            if (boid !== this && this.dist2Boid(boid) < this.alignmentRange){
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

            this.vx += (xvel_avg - this.vx)*this.alignmentFactor
            this.vy += (yvel_avg - this.vy)*this.alignmentFactor
            this.vz += (zvel_avg - this.vz)*this.alignmentFactor
        }

    }

    cohesion(boids:Boid[], negate:number) {

        let xpos_avg = 0
        let ypos_avg = 0
        let zpos_avg = 0
        let neighboring_boids = 0

        for (const b in boids){
            const boid = boids[b]
            if (boid !== this && this.dist2Boid(boid) < this.cohesionRange){
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

            this.vx += (xpos_avg - this.x)*this.cohesionFactor*negate
            this.vy += (ypos_avg - this.y)*this.cohesionFactor*negate
            this.vz += (zpos_avg - this.z)*this.cohesionFactor*negate
        }

    }

    checkEdges() { 
        if (this.y > window.innerHeight - this.marginEdge * 3){
            this.vy -= this.edgeFactor 
        }
        if (this.y < this.marginEdge){
            this.vy += this.edgeFactor
        }
        if (this.z > 1025){
            this.vz -= this.edgeFactor 
        }
        if (this.z < 25){
            this.vz += this.edgeFactor
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
  }

  const calculateRotation = (vx: number, vy: number, vz: number) => {
    const radiansToDegrees = 180 / Math.PI; 
    // Calculate rotation around the x-axis (pitch)
    const pitch = Math.atan2(vy, vz) * radiansToDegrees;
    // Calculate rotation around the y-axis (yaw)
    const v = Math.sqrt(vx**2 + vy**2 + vz**2)
    const yaw = Math.asin(vz / v) * radiansToDegrees; 
    // Calculate rotation around the z-axis (roll)
    const roll = Math.atan2(vy, vx) * radiansToDegrees;
  
    return { x: pitch, y: yaw, z: roll };
  };

const Animate = () => {   
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null); 
    const [boids, setBoids] = React.useState<Boid[]>([]);
    const [negate, setNegate] = React.useState(1);
    
    React.useEffect(() => { 

        const newboids: Boid[] = []
        for(let i = 0;i<76;i++){
            newboids.push(new Boid(Math.random() * window.innerWidth, -Math.random() * 200, 4))
        } 
        setBoids(newboids) 
    
    },[])

    React.useEffect(() => { 

        const drawBoid = (ctx:CanvasRenderingContext2D, boid:Boid) => {

            const a = (boid.z + 400)/1025
            ctx.fillStyle = `rgba(8, 8, 17, ${a})`
            ctx.save();  
           
            const rotation = calculateRotation(boid.vx, boid.vy, boid.vz);
  
            ctx.setTransform(new DOMMatrix()
                .translateSelf(boid.x + boid.size/2, boid.y + boid.size/2) 
                .rotateSelf(0,90 + rotation.y,rotation.z)
            );
            
            ctx.beginPath(); 
            ctx.arc(0, 0, 4, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill(); 
            // ctx.restore();

            ctx.setTransform(new DOMMatrix()
                .translateSelf(boid.x + boid.size/2, boid.y + boid.size/2)
                // .translateSelf(700, 600)
                .rotateSelf(0,rotation.y,rotation.z)
            ); 
            
            const zsize = ((boid.z + 1000) /  500)
            if (zsize >= 0){ 
                ctx.scale(zsize, zsize) 

            ctx.beginPath(); 
            ctx.moveTo(-10, 0);
            ctx.lineTo(0, 2);
            ctx.lineTo(3, 0);
            ctx.lineTo(0, -2);
            ctx.closePath();
            ctx.fill(); 
            }
            

            ctx.restore();
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (ctx && canvas){ 
        
            const animate = (time:number, prevTime:number) => {

                const elapsedTime = (time - prevTime) / 17
                
                ctx.clearRect(0, 0, canvas.width, canvas.height); 

                boids.sort((a, b) => a.z - b.z);
                for (const b in boids){
                    const boid = boids[b]
                    boid.seperate(boids); 
                    boid.alignment(boids); 
                    boid.cohesion(boids, negate);
                    boid.clampSpeed();
                    boid.checkEdges();
                    boid.move(elapsedTime)
                    drawBoid(ctx, boid);
                }
                
            
                // Request the next animation frame
                requestAnimationFrame((t) => animate(t, time));
            };
        
            animate(performance.now(), performance.now()); // Start the animation loop
        }

        const handleMouseDown = () => {
            setNegate(-1)
        }
        const handleMouseUp = () => {
            setNegate(1)
        }

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

    
        // Cleanup function
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        };

      }, [boids, setNegate]);
    
    return (  
        <CanvasDiv id="animate-div">
            <canvas ref={canvasRef} width={window.innerWidth - 40} height={window.innerHeight - 40}></canvas>
        </CanvasDiv> 
    );
};

export default Animate;

