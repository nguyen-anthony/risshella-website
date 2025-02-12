import React from "react";
import { Box } from "@mui/material";

interface IFrameBoxProps {
  url: string; // Define the prop for the iframe URL
}

const IFrameBox: React.FC<IFrameBoxProps> = ({ url }) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "850px",
        height: "640px",
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: 3,
        border: "1px solid #ccc",
      }}
    >
      <iframe
        src={url}
        title="Example Iframe"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      ></iframe>
    </Box>
  );
};

export default IFrameBox;
