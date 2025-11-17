import React from "react";
import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

interface IFrameBoxProps {
  url: string; // Define the prop for the iframe URL
}

const IFrameBox: React.FC<IFrameBoxProps> = ({ url }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Extract the document ID from the Google Docs URL to create a mobile-friendly link
  const getDocumentInfo = (url: string) => {
    // Check if it's a published document with /d/e/ format
    const publishedMatch = url.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (publishedMatch) {
      return { 
        id: publishedMatch[1], 
        isPublished: true 
      };
    }
    
    // Check if it's a regular document with /d/ format
    const regularMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (regularMatch) {
      return { 
        id: regularMatch[1], 
        isPublished: false 
      };
    }
    
    return null;
  };
  
  const docInfo = getDocumentInfo(url);
  // Create a mobile-friendly URL based on the document type
  const mobileUrl = docInfo 
    ? (docInfo.isPublished 
        ? `https://docs.google.com/document/d/e/${docInfo.id}/pub`
        : `https://docs.google.com/document/d/${docInfo.id}/pub`)
    : url.replace('?embedded=true', '');

  if (isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 3,
          border: "1px solid #ccc",
          borderRadius: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h6" align="center">
          Challenge Rules Document
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          For the best mobile experience, open the document in a new tab:
        </Typography>
        <Button
          variant="contained"
          startIcon={<OpenInNew />}
          href={mobileUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="large"
        >
          Open Challenge Rules
        </Button>
        <Typography variant="caption" align="center" color="text.secondary">
          Opens in Google Docs mobile view
        </Typography>
      </Box>
    );
  }
  // Desktop view - show the iframe as before
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: "100%", md: "850px" },
        height: {
          xs: "400px", // Fixed reasonable height on mobile
          md: "600px", // Fixed height on desktop
        },
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: 3,
        border: "1px solid #ccc",
        mx: "auto", // center horizontally
      }}
    >
      <iframe
        src={url}
        title="Document Viewer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="fullscreen"
        loading="lazy"
      ></iframe>
    </Box>
  );
};

export default IFrameBox;
