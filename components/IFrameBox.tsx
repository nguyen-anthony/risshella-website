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
        width: { xs: "100%", md: "850px" },
        height: {
          xs: "calc(100vh - 220px)", // nearly full screen on mobile
          md: "calc(100vh - 200px)", // fixed height on desktop
        },
        paddingTop: { xs: "75%", md: 0 },
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
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      ></iframe>
    </Box>
  );
};

export default IFrameBox;
