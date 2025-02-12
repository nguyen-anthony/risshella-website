// app/about.tsx
'use client'
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Navigation from '@/components/Navigation';
import IFrameBox from '@/components/IFrameBox'
import styles from '@/app/page.module.css';
import PacksToggleList from '@/components/PacksToggleList'

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CareerLegacy() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <h1>Career Legacy Challenge</h1>
        <Box sx={{ width: '100%', display: "flex", justifyItems: "center", flexDirection: "column", alignItems: "center"}}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="tabs">
              <Tab label="Challenge Rules" />
              <Tab label="Randomizer"/>
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <IFrameBox url="https://docs.google.com/document/d/e/2PACX-1vQ0gWK-GPO9t4wXLn64tQ42zz1tIyjfaTpAZlge1LeOFViDZVsIFnxjdAuIn9_oaqeHVmH1O4n0Iqpl/pub?embedded=true" />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <PacksToggleList/>
          </CustomTabPanel>
        </Box>
      </main>
      <footer className={styles.footer}>
        {/* Footer content */}
      </footer>
    </div>
  );
}