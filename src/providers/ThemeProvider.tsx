import { createTheme, ThemeProvider } from '@mui/material';
import { FC } from 'react';

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
});

type CustomThemeProviderProps = {
  children: React.ReactNode;
};

export const CustomThemeProvider: FC<CustomThemeProviderProps> = ({
  children,
}) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
