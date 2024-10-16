import * as React from "react";
import { Link } from "react-router-dom"; // Ensure you have react-router-dom installed
import { Box, Button, Container, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import levelConfig from "./levelConfig.json"; // Importing the JSON file directly
import axios from "axios";
import { apiUrl } from "../Constants";

const NUMBER_OF_LEVELS = 4;

const StyledButton = styled(Button)(({ theme }) => ({
  display: "block",
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  fontSize: "24px",
  textAlign: "center",
  backgroundColor: "#4CAF50", // Green background
  color: "white", // White text
  borderRadius: "8px",
  textDecoration: "none",
  width: "100%", // Adjust width for mobile
  maxWidth: "300px", // Limit max width
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: "#45a049", // Darker green on hover
  },
  "&:disabled": {
    backgroundColor: "#d3d3d3", // Light gray for disabled state
    color: "#a9a9a9", // Dark gray for text color of disabled state
  },
}));

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

const LevelSelect: React.FC = () => {
  const [finalClue, setFinalClue] = React.useState("");
  const [gameSolved, setGameSolved] = React.useState("");
  // State to hold the solved clues
  const [solvedClues, setSolvedClues] = React.useState<{
    [key: string]: string;
  }>({});

  // Load solvedClues from localStorage on component mount
  React.useEffect(() => {
    const solvedClues = JSON.parse(localStorage.getItem("solvedClues") || "{}");
    setSolvedClues(solvedClues);

    // Check if there are 4 solved clues
    if (Object.keys(solvedClues).length === NUMBER_OF_LEVELS) {
      // Concatenate the answers of the 4 solved clues
      const sortedClueKeys = Object.keys(solvedClues).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );

      // Concatenate the answers in the correct order
      const answer = sortedClueKeys.map((key) => solvedClues[key]).join("");

      setGameSolved(answer);
    }
  }, []);

  const endGame = () => {
    // Prepare formData
    const formData = new FormData();
    formData.append("answer", gameSolved);

    // Send a POST request to fetch the final clue
    axios
      .post(apiUrl + "/api/fetch-final-answer", formData)
      .then((response) => {
        // Update state with the final clue
        setFinalClue(response.data.finalClue);
      })
      .catch((error) => {
        console.error("Error fetching final clue:", error);
        // Handle errors if needed
      });
  };

  if (finalClue) {
    return (
      <CenteredContainer>
        <SolvedText>CONGRATS!</SolvedText>
        <ClueText>{finalClue}</ClueText>
      </CenteredContainer>
    );
  }

  return (
    <Container
      maxWidth="sm" // Center the content and limit width on larger screens
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Level Select
      </Typography>
      {levelConfig.map((level, index) => {
        const clueID = index.toString(); // Convert index to string for keys
        const isSolved = clueID in solvedClues; // Check if clueID is in solvedClues

        return (
          <div key={level.id} style={{ width: "100%", maxWidth: "300px" }}>
            {isSolved ? (
              <StyledButton disabled>{solvedClues[clueID]}</StyledButton> // Display solved clue value
            ) : (
              <Link
                to={`/scavenge?clueID=${clueID}`}
                style={{ textDecoration: "none" }}
              >
                <StyledButton>LEVEL {index + 1}</StyledButton>
              </Link>
            )}
          </div>
        );
      })}
      {gameSolved && (
        <>
          <Typography>You found the secret word: {gameSolved}</Typography>
          <StyledButton
            onClick={() => {
              endGame();
            }}
          >
            SUMBIT ANSWER!
          </StyledButton>
        </>
      )}
    </Container>
  );
};

export default LevelSelect;
