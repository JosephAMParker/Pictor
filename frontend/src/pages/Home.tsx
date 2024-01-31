// Home.tsx
import * as React from 'react';
import axios from 'axios'; 
import { apiUrl } from '../Constants';
import { Box, Button, Container, CssBaseline, Grid, List, ListItem, ThemeProvider, Typography, createTheme, responsiveFontSizes, styled } from '@mui/material'; 
import { Link } from 'react-router-dom'; 
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import PDFRenderer from '../util/PDFRenderer'; 

let theme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    button: {
      textTransform: 'none', 
    }
  },
});
theme = responsiveFontSizes(theme);

const AppContainer = styled(Box)`
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: #f5f0e6;  
`;

const StyledContainer = styled(Container)`
  && {
    margin: 20px;
    padding: 20px;
    text-align: left; 
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: #fffefc;  
    max-width: none;
    border: 1px solid black;  
  }
`;  

const Title = styled(Typography)`
  && {
    margin-bottom: 10px;
    text-align: left;
  }
`;

const Subtitle = styled(Typography)`
  && {
    margin-bottom: 20px;
    text-align: left;
  }
`;

const ContentList = styled(List)`
  && {
    margin-top: 0px;
    padding-top: 0px;
  }
`;

const ContentItem = styled(ListItem)`
  && { 
    padding: 0;
  }
`;

const ContentButton = styled(Button)`
  && { 
    padding: 0;
    justify-content: left !important;
    color: black;

    span {
      padding-right: 5px;
    }
  }
`;

const ContentDiv = styled('div')`
  && { 
    p {
      margin-top: 0; 
    }
  }
`;

const PDFButtons = styled('div')`
  && { 
    width: 100%;
    max-width: calc(100% - 2em);
    background-color: #f5f0e6;
    text-align: center; 
    padding:10px;
  }

  & button {
    color: black;  
  }
`;

const InfoP = styled('p')`
  && {  
  }

  & button {
    color: black; 
  }
`;


export enum ContentPage {
  GREETING = 'Greeting',
  PROJECTS = 'Projects',
  INFO = 'Info',
  NULL = 'null'
}

interface HomeProps {
  content: ContentPage 
  setContent: React.Dispatch<React.SetStateAction<ContentPage>> 
  message: string 
  setMessage: React.Dispatch<React.SetStateAction<string>> 
  company: string 
  setCompany: React.Dispatch<React.SetStateAction<string>> 
  urlParameter: string 
  setUrlParameter: React.Dispatch<React.SetStateAction<string>> 
  coverLetter: any 
  setCoverLetter: React.Dispatch<React.SetStateAction<any>> 
}

const Home = (props: HomeProps) => {   
  
  const { coverLetter, 
          setCoverLetter, 
          content, 
          setContent, 
          message, 
          setMessage, 
          company,
          setCompany, 
          urlParameter, 
          setUrlParameter } = props    

  const resume_pdf = process.env.PUBLIC_URL + '/resume.pdf'

  const [pdf, setPDF] = React.useState(resume_pdf)
  const pdfRef = React.useRef<HTMLDivElement | null>(null);

  const handleScrollToPDF = () => {
    // Scroll to the top of the pdf window
    pdfRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => { 

    const getUserMessage = async () => {
      try { 
        const user_type = localStorage.getItem('user_type')  
        if (user_type && user_type !== 'UnknownUser'){ 
          if(!message || !company){
            const formData = new FormData(); 
            formData.append('ut', user_type.toString());
            const response = await axios.post(apiUrl + '/api/get-message', formData); 
            setMessage(response.data.user_message)
            setUrlParameter(response.data.company_site) 
            setCompany(user_type)
            setContent(ContentPage.GREETING);
          } 
          
        } else {
          setContent(ContentPage.PROJECTS);
        }
      } catch (error) {
        console.error('Error getting user info:', error); 
      }
    }

    const getCoverLetter = async () => {
      try {
        const user_type = localStorage.getItem('user_type')  
        if (user_type && user_type !== 'UnknownUser' && !coverLetter){
          const formData = new FormData(); 
          formData.append('ut', user_type.toString());
          const response = await axios.post(apiUrl + '/api/get-cover-letter', formData, { responseType: 'blob' });
          const file = response.data
          setCoverLetter(URL.createObjectURL(file));
        } 
      } catch (error) {
        console.error('Error getting user info:', error); 
      }
    }

    getUserMessage()
    getCoverLetter()

    // Listen for the custom event
    window.addEventListener('userSetupComplete', getUserMessage);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('userSetupComplete', getUserMessage);
    }; 

  }, [message, company, coverLetter, setMessage, setUrlParameter, setContent, setCompany, setCoverLetter]);

  const renderGreeting = () => {

    return (
      <>
        {message && company && ( 
          <p>Hello Hiring team for {company}! <br /> {message}</p> 
        )}
      </>
    )

  }

  const renderProjects = () => {

    return (
      <>
        <div><Link to="/pictor">Pictor</Link></div>
        <div><Link to="/neowise">NeoWise</Link></div>
        <div><Link to={`/screen?url=${encodeURIComponent(urlParameter)}`}>Screen</Link></div>
      </>
    )

  }

  const renderInfo = () => {

    return (
      <InfoP>
        <p>joeyparker47@gmail.com </p>
        <p>Based in Vancouver, BC</p> 
        <Button onClick={() => {setPDF(resume_pdf); handleScrollToPDF()}}>Resume</Button> 
        {coverLetter && <Button onClick={() => {setPDF(coverLetter); handleScrollToPDF()}}>Cover Letter</Button>}
      </InfoP> 
    )

  }

  const renderContent = () => {
    switch (content) {
      case ContentPage.GREETING:
        return renderGreeting();
      case ContentPage.PROJECTS:
        return renderProjects();
      case ContentPage.INFO:
        return renderInfo();
      default:
        return <></>;
    }
  }; 

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContainer>
        <StyledContainer>
          <Grid container spacing={3}>
            <Grid item>
                <Title variant="h3">Joseph Parker</Title>
                <Subtitle variant="h6">Software Developer</Subtitle>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              {/* Button List */} 
                <ContentList>
                  {Object.values(ContentPage).map((page, index) => (
                    (page !== ContentPage.NULL && (page !== ContentPage.GREETING || (message && company)) && 
                    <ContentItem key={index}>
                      <ContentButton onClick={() => setContent(page)}>
                        {content === page && <span>&#8226; </span>}
                        {page}
                      </ContentButton>
                    </ContentItem>
                    )
                  ))}
                </ContentList>   

            </Grid>
            <Grid item xs={12} md={9}>
              {/* Content */}  
              <ContentDiv>
                {renderContent()}
              </ContentDiv> 
            </Grid> 
          </Grid>
        </StyledContainer>
      </AppContainer> 

      <PDFButtons ref={pdfRef}>
        {coverLetter && <Button onClick={() => setPDF(coverLetter)}>Cover Letter</Button>}
        <Button onClick={() => setPDF(resume_pdf)}>Resume</Button>
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Scroll to Top</Button>
      </PDFButtons> 
      
      <PDFRenderer file={pdf} />   

      <PDFButtons > 
        <Button onClick={() => handleScrollToPDF()}>Scroll Up</Button>
      </PDFButtons> 
      
    </ThemeProvider>
  );
};

export default Home; 