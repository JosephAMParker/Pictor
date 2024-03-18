// Home.tsx
import * as React from 'react';
import axios from 'axios'; 
import { apiUrl } from '../Constants';
import { Box, Button, Container, CssBaseline, Grid, List, ListItem, TextField, ThemeProvider, Typography, createTheme, responsiveFontSizes, styled } from '@mui/material'; 
import { Link } from 'react-router-dom'; 
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import PDFRenderer from '../util/PDFRenderer';  
import Croids from '../animate/Croids';

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
  @media only screen and (min-width: 1384px) {
    height: 100vh;
  }
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background-color: #f5f0e6; 
  z-index: 2; 
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

    background-color: #fffefc;
    z-index: 900;
    opacity: 0.8;
    border-radius: 50px;   
  
    &&::before { 
      z-index: -1;
      background: inherit;
      filter: blur(30px); /* Apply blur effect to the pseudo-element */
    } 
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

const TitleGrid = styled(Grid)`
&& {   
  background-color: #fffefc;
  z-index: 900;
  opacity: 0.8;
  border-radius: 50px;   

  &&::before { 
    z-index: -1;
    background: inherit;
    filter: blur(10px); /* Apply blur effect to the pseudo-element */
  } 
}
`; 

const ContentDiv = styled('div')`
  && {  
    width: fit-content;
    position: relative; 
    background-color: #fffefc;
    z-index: 900;
    opacity: 0.8;
    border-radius: 50px;
    max-height: calc(100vh - 80px); /* Set a maximum height for the content */
    overflow-y: auto; /* Enable vertical scrolling */
    overflow-x:hidden;
    padding: 10px; /* Add padding for better readability */ 
    scrollbar-width: none;
    /* Hide scrollbar for WebKit browsers */
    &::-webkit-scrollbar {
      width: 0;  /* Make scrollbar invisible */
      background: transparent;  /* Make scrollbar background transparent */
    }

    @media only screen and (min-width: 1384px) {
      padding-top: 100px;
    }

    &&::before { 
      z-index: -1;
      background: inherit;
      filter: blur(10px); /* Apply blur effect to the pseudo-element */
    }
    p {
      margin-top: 0; 
    }
  }
`; 

const PDFButtons = styled('div')`
  && { 
    width: 100%;
    background-color: #f5f0e6;
    text-align: center; 
    padding:10px;
  }

  & button {
    color: black;  
  }
`;

const InfoP = styled('div')`
  && {  
  }

  & p {  
    margin-bottom: auto;
  } 

  & button {
    color: black; 
    padding:0;
    justify-content: left !important;
  }

`;

const Projects = styled('div')`
  && {   
    
  } 
`;

const ProjectDiv = styled('div')`
  & p {  
    margin-bottom: auto;
  } 

  & h1 {
    margin-bottom: 0px;
  }
`;

const ScreenSmashDiv = styled(ProjectDiv)` 
  & div {
    display: table;
  }
  & span {
    display: table-cell;
    vertical-align:middle;
    padding: 10px;
  }   
`

const URLLink = styled(Link)`
  && {
    display: table-cell;
    vertical-align:middle; 
    padding: 10px;
  }
`

const ProjectLinkDiv = styled('div')`
  && {
    padding-top:10px;
  }
`

export enum ContentPage {
  GREETING = 'Greeting',
  PROJECTS = 'Projects',
  INFO = 'Info',
  BIRDS = 'Watch the birds',
  NULL = 'null',
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
  jobTitle: string
  setJobTitle: React.Dispatch<React.SetStateAction<string>> 
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
          setUrlParameter,
          jobTitle,
          setJobTitle } = props    

  const resume_pdf = process.env.PUBLIC_URL + '/resume.pdf'

  const [pdf, setPDF] = React.useState(resume_pdf)
  const [urlInput, setUrlInput] = React.useState('');
  const [urlWarning, setUrlWarning] = React.useState('');
  
  const [coverLetterLoading, setCoverLetterLoading] = React.useState(false)
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
            setJobTitle(response.data.job_title)
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
        if (user_type && user_type !== 'UnknownUser' && !coverLetter && !coverLetterLoading){
          setCoverLetterLoading(true);
          const formData = new FormData(); 
          formData.append('ut', user_type.toString());
          const response = await axios.post(apiUrl + '/api/get-cover-letter', formData, { responseType: 'blob' });
          const file = response.data
          setCoverLetter(URL.createObjectURL(file));
          setCoverLetterLoading(false);
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

  }, [message, company, coverLetter, setMessage, setUrlParameter, setContent, setCompany, setCoverLetter, setJobTitle, coverLetterLoading]);

  const renderGreeting = () => {

    return (
      <>
        {message && company && ( 
          <>
            <p>Hello Hiring team for {company}! <br /> 
               Welcome to my site. You can find some of my projects from the menu on the left in the 'Projects' tab, <br/>
               And in 'Info' you will find my Resume {coverLetter && 'and my Cover Letter'} for my application to the {jobTitle} position.
            </p>  
            <p>Enjoy your stay and I hope I will be hearing from you soon!</p>
          </>
        )}
      </>
    )

  }

  const handleURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try{ 
      const protocolPattern = new RegExp('^(https?://)', 'i'); 
      if(!protocolPattern.test(event.target.value)){
        throw new SyntaxError(event.target.value + ' 1is not a valid URL.', {"cause": 'incorrectProtocol'})
      }
      var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	    '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
      if(!urlPattern.test(event.target.value)){
        throw new SyntaxError(event.target.value + ' 2is not a valid URL.', {"cause": "bad url"})
      }
      new URL(event.target.value)
      setUrlWarning('')
    } catch(error) {
      if (error instanceof TypeError || error instanceof SyntaxError || error instanceof RangeError) {
        // Handle invalid URL error 
        if (error.cause === 'incorrectProtocol'){
          setUrlWarning('missing http:// or https:// Try copying the url directly from your browsers search bar.')
        } else {
          setUrlWarning('invalid URL. Try copying the url directly from your browsers search bar.'); 
        }
      } else {
        // Handle other types of errors
        console.error('Unexpected error occurred:', error);
      }
    } 
    setUrlInput(event.target.value);
  }

  const handleURLDoneTyping = () => {

  }

  const pictorProject = () => {
    return (
      <ProjectDiv>
        <h1>Pictor</h1>
        <p>A web app for creating glitch art using a concept called pixel sorting. Users can experiment with several different settings to create unique visual effects.</p>
       <ProjectLinkDiv>
        <Link to="/pictor">Pictor</Link>
       </ProjectLinkDiv>
      </ProjectDiv>
    )
  }

  const blackHoleProject = () => {
    return (
      <ProjectDiv>
        <h1>Luminet's Black hole</h1>
        <p>An interactive implementation of Jean-Pierre Luminet's <a target="_blank" rel="noreferrer" href="https://articles.adsabs.harvard.edu/pdf/1979A%26A....75..228L#page=8">Image of a spherical black hole with thin accretion disk (1979).</a></p>
        <p>The first "image" of a black hole, hand plotted by Luminet in 1979 with the aid of an early computer. 
          In my implementation, users can view the blackhole from any inclination angle, 
          as well as toggle between Einsteinian and Newtonian physics models and highlight select parts of the black hole to further help in understanding the image.</p>
        <br/>
        <p>Images are pre generated using python and presented in a React app here:</p>
       <ProjectLinkDiv>
        <Link to="/luminet">Luminet's black hole</Link>
        
       </ProjectLinkDiv>
      </ProjectDiv>
    )
  }

  const croidsProject = () => {
    return (
      <ProjectDiv>
        <h1>Croids</h1>
        <p>My take on the classic artificial life simulation, <a target="_blank" rel="noreferrer" href='http://www.red3d.com/cwr/boids/'>Boids</a>, developed by Craig Reynolds.</p>
        <p>But, since I live in Vancouver and have always loved our <a target="_blank" rel="noreferrer" href='https://www.thenatureofcities.com/2019/04/26/crows-vancouver-middle-way-biophobia-biophilia/'>giant crow population</a>, I decided to make them crows instead.</p>
        <p>Crows, Boids ... Croids</p>
      </ProjectDiv>
    )
  }

  const screenSmashProject = () => {
    return (
      <ScreenSmashDiv>
        <h1>Screen Smasher</h1>
        <p>Notice that big red button over to the right? Try pressing it for some cathartic fun. You can find this button on almost any page of this site.</p> 
        <p>You can also try it on any url you want here: </p>
        <p>(Beta feature, may not work correctly or at all on some urls) </p>
        <div>
        <br/>
        <TextField 
          label="URL"
          variant="outlined"
          value={urlInput}
          onChange={handleURLChange}
          onBlur={handleURLDoneTyping} // Trigger setURL when user finishes typing
          InputProps={{
            style: { overflow: 'hidden' } // Set width to 100%
          }}
        />
        <br/>
        {urlInput && urlWarning === '' && <URLLink to={`/screen?url=${encodeURIComponent(urlInput)}`}>GO!</URLLink>}
        {urlInput !== '' && <span>{urlWarning}</span>}
        </div>
        {urlParameter && urlParameter !== 'https://example.com/' && (
          <>
            <p>Or, try it out on your own company's website</p>
            <Link to={`/screen?url=${encodeURIComponent(urlParameter)}`}>{urlParameter}</Link>
          </>
        )
        }
        <p>What was the point of making this you ask? Well ... why not?</p>
      </ScreenSmashDiv>
    )
  }

  const neoWiseProject = () => {
    return (
      <ProjectDiv>
        <h1>NeoWise</h1>
        <p>A game being developed for mobile devices. Still early in development.</p>
        <p>Named after NASA's <a target="_blank" rel="noreferrer" href='https://www.jpl.nasa.gov/missions/neowise'>NEOWISE</a> mission to find <b>N</b>ear <b>E</b>arth <b>O</b>bjects that may pose a threat to Earth.</p>
 
        <ProjectLinkDiv>
          <Link to="/neowise">NeoWise Game</Link>
        </ProjectLinkDiv>
      </ProjectDiv> 
    )
  }

  const renderProjects = () => {

    return (
      <Projects> 
        {pictorProject()}
        {blackHoleProject()} 
        {neoWiseProject()}
        {screenSmashProject()}
        {croidsProject()}
      </Projects>
    ) 
  }

  const renderInfo = () => {

    return (
      <InfoP>
        <p>joeyparker47@gmail.com </p>
        <p>Based in Vancouver, BC</p>  
        <div>{coverLetter && <Button onClick={() => {setPDF(coverLetter); handleScrollToPDF()}}>Cover Letter</Button>}</div>
        <div><Button onClick={() => {setPDF(resume_pdf); handleScrollToPDF()}}>Resume</Button></div>
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
      case ContentPage.BIRDS:
        return <></>;
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
              {/* Title */} 
              <Title variant="h3">Joseph Parker</Title>
              <Subtitle variant="h6">Software Developer</Subtitle> 
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

      <Croids />           
       
    </ThemeProvider>
  );
};

export default Home; 