import * as React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styled from 'styled-components';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`; 

const PDFContainer = styled('div')`
  && { 
    display: flex;
    flex-direction: column;
    align-items: center; 
    min-height: 2000px;
    background-color: #f5f0e6;
    .react-pdf__Document {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      border: 1px solid black; 
      margin: 10px;
    } 
  }
`; 

interface PDFRendererProps { 
    file: any  
}

const PDFRenderer = (props: PDFRendererProps) => {   
  
  const { file } = props     

  return (  
      <PDFContainer>
        <Document file={file} >
          <Page width={window.screen.width*0.8} pageNumber={1} /> 
        </Document>
      </PDFContainer> 
  );
};

export default PDFRenderer; 