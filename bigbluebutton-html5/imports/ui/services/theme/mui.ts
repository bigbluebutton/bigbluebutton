import { createTheme } from '@mui/material/styles';

// Shared by the client and by the pre-flight, which renders before the join,
// outside the client's ThemeProvider.
const muiTheme = createTheme({
  typography: {
    fontFamily: 'Source Sans Pro, Arial, sans-serif',
  },
});

export default muiTheme;
