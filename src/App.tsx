import { Box } from '@mui/material';
import TextChat from './features/text-chat/TextChat';
import { CustomThemeProvider } from './providers/ThemeProvider';

function App() {
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
        <TextChat />
      </Box>
    </CustomThemeProvider>
  );
}

export default App;
