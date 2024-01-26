// Home.tsx
import * as React from 'react';
import Dashboard from '../dashboard/Dashboard';
import Examples from '../examples/Examples';

const Pictor = () => {    
    const examplesRef = React.useRef<HTMLDivElement | null>(null);

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