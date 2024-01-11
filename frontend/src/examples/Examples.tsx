// Examples.tsx

import { Container, Divider } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import DirectionAndPath from './DirectionAndPath';
import ThresholdExample from './ThresholdExample'; 
import Masking from './Masking'; 
import StarExample from './StarExample';

const Examples = () => {    
  return (
    <Container style={{   marginLeft: '333px', marginRight: '333px', paddingLeft:'0', paddingRight:'0' }}>
      <DirectionAndPath />
      <Divider />
      <ThresholdExample />
      <Divider />
      <Masking />
      <Divider />
      <StarExample />
    </Container>
  );
};

export default Examples;