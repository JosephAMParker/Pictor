// Scavenge.tsx
import * as React from "react";
import { useLocation } from "react-router-dom";
import LevelSelect from "../scavenge/LevelSelect";
import Scavenge from "../scavenge/Scavenge";

const ScavengePage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clueID = queryParams.get("clueID");

  return clueID ? <Scavenge clueID={clueID} /> : <LevelSelect />;
};

export default ScavengePage;
