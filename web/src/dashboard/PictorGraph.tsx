import * as React from 'react';  
import * as d3 from 'd3'; 
import { useRef } from 'react';
import styled from 'styled-components';
import { wait } from '@testing-library/user-event/dist/utils';


interface GraphSVGProps {
    rotation: number; 
}

const GraphSVG = styled.div.attrs<GraphSVGProps>((props) => ({
    style: {
      pointerEvents: 'none',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      transform: `translate(-50%, -50%) rotate(${props.rotation}deg)`,
      zIndex: 99,
      transformOrigin: 'center center',
    },
  }))<GraphSVGProps>``;

type PictorGraphProps = {
    pathType:string
    w:number 
    h:number
    amp:number
    freq:number
    xPos:number
    rotationAngle: number; 
}

export default function PictorGraph(props:PictorGraphProps){

    const {pathType, w, h, amp, freq, xPos, rotationAngle} = props
    const [paddingTop, setPaddingTop] = React.useState('50%')
    const [paddingSide, setPaddingSide] = React.useState('50%')
    const svgRef = useRef<SVGSVGElement | null>(null);   
    React.useEffect(() => {

        if (!svgRef || !svgRef.current || !svgRef.current.parentElement) return;

        const reverseGraph = (rotationAngle > 90 && rotationAngle < 180) || (rotationAngle > 270 && rotationAngle < 360) 

        const generateData = (func: any, w: number) => {
            const data = [];
            for (let x = 0; x <= w; x += 1) {
                data.push({ x, y: func(x)});
            }
            return data;
        }; 
        const pi = Math.PI;
        const toRad = (pi/180)
        const sineFunction = (x:number) => Math.sin(((x - xPos) * toRad) * freq / 90) * amp + h/2;
        const curveFunction = (x:number) =>  10 * amp * (x - xPos) * (x - xPos) / (w * w) + h/6;
        const circleFunction = (x:number) => {
            if (x < xPos - amp || x > xPos + amp){
                return  h/2
            } 
            return Math.sqrt(amp**2 - (x - xPos)**2) + h/2 
        }
        const lineFunction = (x:number) => h/2 ;

        let func = lineFunction 
        if (pathType == 'sine'){
            func = sineFunction
        } else if (pathType == 'line'){
            func = lineFunction
        } else if (pathType == 'circle'){
            func = circleFunction
        } else if (pathType == 'curve'){
            func = curveFunction
        }  


        const svg = d3.select(svgRef.current);   
        const data = generateData(func, w)
    
        const xScale = d3.scaleLinear().domain([0, w]).range([0, w]);
        const yScale = d3.scaleLinear().domain([0, h]).range([h, 0]); 
        const line = d3
            .line<{ x: number }>()
            .x((d) => xScale(reverseGraph ? w-d.x:d.x))
            .y((d) => yScale(func(d.x)));
    
        svg.selectAll('*').remove(); // Clear existing elements 

        svg
            .append('g')  
            .append('path')
            .data([data])
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke', 'blue')
            .style('fill', 'none')
            .style('stroke-width', 6);

            svg.append('line')
            .style("stroke", "lightgreen")
            .style("stroke-width", 2)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", w)
            .attr("y2", h);
            svg.append('line')
            .style("stroke", "lightgreen")
            .style("stroke-width", 2)
            .attr("x1", 0)
            .attr("y1", h)
            .attr("x2", w)
            .attr("y2", 0);
            svg.append('line')
            .style("stroke", "lightgreen")
            .style("stroke-width", 2)
            .attr("x1", 0)
            .attr("y1", h/2)
            .attr("x2", w)
            .attr("y2", h/2);
            

            const bbox = svgRef.current.getBBox();  
            const viewBoxValue = `${0} ${0} ${w} ${h}`; 
            svg.attr('viewBox', viewBoxValue);
            svg.attr('preserveAspectRatio', "xMidYMid meet")

      }, [  pathType, w, h, amp, freq, xPos, rotationAngle]);

        return <GraphSVG id="container" rotation={-rotationAngle}  style={{ transformOrigin: 'center center'}}> <svg ref={svgRef}  /></GraphSVG>;
      // return <div> <svg ref={svgRef}  /></div>;

}
