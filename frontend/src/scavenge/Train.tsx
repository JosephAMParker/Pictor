// Train.tsx
import * as React from "react";
import { Root, Preview, Footer, GlobalStyle } from "./styles";
import { Fragment, useState } from "react";
import { Camera } from "./Camera";
import axios from "axios";
import { apiUrl } from "../Constants";
import { TextField, styled } from "@mui/material";

const DirTextField = styled(TextField)({
  "padding-top": "50px",
});

const Train: React.FC = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();
  const [directoryName, setDirectoryName] = useState("table");
  const [idx, setIdx] = useState(0);

  function handleCapture(blob: Blob) {
    const formData = new FormData();
    formData.append("imageFile", blob, "image.jpg");
    formData.append("directoryName", directoryName);

    axios
      .post(apiUrl + "/api/scavenge-save-image", formData)
      .then((response) => {
        console.log("Image uploaded successfully:", setIdx(response.data.idx));
        // You can handle the response as needed
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
        // You can handle errors as needed
      });
  }

  return (
    <Fragment>
      <Root>
        {isCameraOpen && (
          <>
            <Camera
              onCapture={(blob: any) => handleCapture(blob)}
              onClear={() => setCardImage(undefined)}
            />
          </>
        )}

        {"number of images: " + idx}

        <DirTextField
          id="outlined-controlled"
          value={directoryName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setDirectoryName(event.target.value);
          }}
        />

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
      <GlobalStyle />
    </Fragment>
  );
};

export default Train;
