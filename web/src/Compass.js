import React, { useState, useEffect, useRef } from 'react';

const Compass = ({ direction, setDirection }) => {
    const compassRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [displayDirection, setDisplayDirection] = useState(360 - direction)

    useEffect(() => {
        setDisplayDirection(360 - direction)
    }, [direction])

    const calculateAngle = (event) => {
        const compassRect = compassRef.current.getBoundingClientRect();
        const centerX = compassRect.left + compassRect.width / 2;
        const centerY = compassRect.top + compassRect.height / 2;

        const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
        const dist = Math.pow(event.clientY - centerY, 2) + Math.pow(event.clientX - centerX, 2)
        let degrees = (angle * 180) / Math.PI;
        degrees = ((degrees + 360) % 360) | 0
        if (dist <= 10000){
            return degrees - degrees % 5
        } 
        return degrees
    };

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (event) => {
        if (isDragging) {
            const newDirection = calculateAngle(event); 
            setDisplayDirection(newDirection);
            setDirection(360 - newDirection)
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

  return (
    <div
      ref={compassRef}
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'lightblue',
        cursor: 'pointer',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '3px',
          height: '50%',
          background: 'red',
          transformOrigin: 'top',
          transform: `rotate(${displayDirection-90}deg)`,
        }}
      ></div>
    </div>
  );
};

export default Compass;
