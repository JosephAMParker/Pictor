import * as React from "react";
import { Link } from "react-router-dom"; // Ensure you have react-router-dom installed
import { Button, Container, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import levelConfig from "./levelConfig.json"; // Importing the JSON file directly

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

const LevelSelect: React.FC = () => {
  // State to hold the solved clues
  const [solvedClues, setSolvedClues] = React.useState<{
    [key: string]: string;
  }>({});

  // Load solvedClues from localStorage on component mount
  React.useEffect(() => {
    const storedClues = JSON.parse(localStorage.getItem("solvedClues") || "{}");
    setSolvedClues(storedClues);
  }, []);

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
      <StyledButton
        onClick={() => {
          localStorage.removeItem("solvedClues"); // Removes solvedClues from localStorage
          window.location.reload(); // Optionally reloads the page to reflect the reset
        }}
      >
        RESET
      </StyledButton>
    </Container>
  );
};

export default LevelSelect;
