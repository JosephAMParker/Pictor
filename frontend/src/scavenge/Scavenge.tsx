// Scavenge.tsx
import * as React from "react";
import { Root, Preview, Footer, GlobalStyle } from "./styles";
import { Fragment, useState } from "react";
import { Camera } from "./Camera";
import axios from "axios";
import { apiUrl } from "../Constants";
import levelConfig from "./levelConfig.json";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  styled,
  Typography,
} from "@mui/material";

const CenteredContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh", // Full viewport height for vertical centering
});

const SolvedText = styled(Typography)({
  fontSize: "2rem", // Adjust size as needed
  fontWeight: "bold", // Make it bold for emphasis
  textAlign: "center",
});

const ClueText = styled(Typography)({
  fontSize: "1.5rem", // Slightly smaller for the clue
  textAlign: "center",
});
interface ScavengeProps {
  clueID: string;
}

const Scavenge: React.FC<ScavengeProps> = ({ clueID }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [levelSolved, setLevelSolved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryAgain, setTryAgain] = useState(false);
  const [cardImage, setCardImage] = useState<Blob>();
  const [answer, setAnswer] = useState<string>();
  const { id, clue, direction } = levelConfig[parseInt(clueID)];

  React.useEffect(() => {
    const solvedClues = JSON.parse(localStorage.getItem("solvedClues") || "{}");
    if (solvedClues[id]) {
      setLevelSolved(true);
      setAnswer(solvedClues[id]);
    }
  }, [id]);

  function handleResponse(fetchedID: string, fetchedAnswer: string) {
    if (fetchedID && fetchedID === id && fetchedAnswer !== "INCORRECT") {
      setLevelSolved(true);
      setTryAgain(false);
      setAnswer(fetchedAnswer);

      const solvedClues = JSON.parse(
        localStorage.getItem("solvedClues") || "{}"
      );
      solvedClues[id] = fetchedAnswer;
      localStorage.setItem("solvedClues", JSON.stringify(solvedClues));
    } else {
      setTryAgain(true);
    }
  }

  function handleCapture(blob: Blob) {
    setCardImage(blob);
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("imageFile", blob, "image.jpg");
    formData.append("clueID", clueID);
    axios
      .post(apiUrl + "/api/scavenge-process-image", formData)
      .then((response) => {
        handleResponse(response.data.clueID, response.data.answer);
      })
      .finally(() => {
        setIsProcessing(false);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
        // You can handle errors as needed
      });
  }

  if (levelSolved) {
    return (
      <CenteredContainer>
        <SolvedText>Level Solved!</SolvedText>
        <ClueText>Answer: {answer}</ClueText>
        <Button
          variant="contained" // You can also use "outlined" or "text"
          color="primary" // Change color as needed
          onClick={() => {
            // Navigate to the scavenge page
            window.location.href = "/scavenge"; // Adjust the path as needed
          }}
          style={{ marginTop: "20px" }} // Optional margin for spacing
        >
          Go Back and Try Another Level
        </Button>
      </CenteredContainer>
    );
  }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "20px",
        }}
      >
        <h1 style={{ flex: 1, textAlign: "center", margin: 0 }}>{clue}</h1>

        <span style={{ fontSize: "0.9em", marginLeft: "auto" }}>
          Look Direction: {direction}
        </span>
      </div>

      <Root>
        {isCameraOpen && (
          <>
            <Camera
              onCapture={(blob: any) => handleCapture(blob)}
              onClear={() => setCardImage(undefined)}
            />
          </>
        )}

        {cardImage && answer && (
          <div>
            <h2>{answer}</h2>
            <Preview src={cardImage && URL.createObjectURL(cardImage)} />
          </div>
        )}

        {!isProcessing && cardImage && tryAgain && "No match! Try again!"}

        <Footer>
          <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
          <button
            onClick={() => {
              setIsCameraOpen(false);
              setCardImage(undefined);
            }}
          >
            Close Camera
          </button>
        </Footer>
      </Root>

      {/* Full-page loading indicator */}
      <Backdrop open={isProcessing} style={{ zIndex: 1000 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <GlobalStyle />
    </Fragment>
  );
};

export default Scavenge;
