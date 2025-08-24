"use client";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Navigation from "@/components/Navigation";
import IFrameBox from "@/components/IFrameBox";
import styles from "@/app/page.module.css";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            width: '100%'
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default function LlamaLegends() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const savedTab = localStorage.getItem("llamaLegendsActiveTabIndex");
    if (savedTab !== null) {
      try {
        const parsedTab = JSON.parse(savedTab);
        if (typeof parsedTab === "number") {
          setValue(parsedTab);
        }
      } catch (error) {
        console.error("Error parsing saved tab index:", error);
      }
    }
  }, []);

  // Tab handling
  function handleChange(event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
    localStorage.setItem("llamaLegendsActiveTabIndex", JSON.stringify(newValue));
  }

  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <h2>Llamas Legends Legacy</h2>
        <p>Website is being revamped, so things will look a little different for some time :)</p>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyItems: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="tabs">
              <Tab label="Challenge Rules" />
            </Tabs>
          </Box>

          {/* Tab Panel 1 */}
          <CustomTabPanel value={value} index={0}>
            <IFrameBox url="https://docs.google.com/document/d/1b6LjunHIkPj8oSAXLj3T2h4OTdaHHrvLNXvMSxsvcYQ/pub?embedded=true" />
          </CustomTabPanel>
        </Box>
      </main>
      <footer className={styles.footer}>{/* Footer content */}</footer>
    </div>
  );
}