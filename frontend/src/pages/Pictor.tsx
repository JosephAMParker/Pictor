// Home.tsx

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../dashboard/Dashboard';
import Examples from '../examples/Examples';

const Pictor = () => {    
    const examplesRef = useRef<HTMLDivElement | null>(null);

    const handleScrollToExamples = () => {
      // Scroll to the top of the Examples component
      examplesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <div style={{'height':'110vh'}}><Dashboard scrollToExamples={handleScrollToExamples}/></div>
            <div ref={examplesRef}><Examples/></div>
        </>
    );
};

export default Pictor;