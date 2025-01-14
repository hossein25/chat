import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import RealtimeChat from './features/realtime-chat/RealtimeChat';
import TextChat from './features/text-chat/TextChat';
import { CustomThemeProvider } from './providers/ThemeProvider';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <CustomThemeProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Tabs value={activeTab} onChange={handleChange}>
          <Tab label="Text Chat" />
          <Tab label="Realtime Chat" />
        </Tabs>
        {activeTab === 0 && <TextChat />}
        {activeTab === 1 && <RealtimeChat />}
      </Box>
    </CustomThemeProvider>
  );
}

export default App;
