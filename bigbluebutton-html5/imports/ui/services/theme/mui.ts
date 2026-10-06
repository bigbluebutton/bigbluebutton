import { createTheme } from '@mui/material/styles';

const typography = {
  fontFamily: 'Source Sans Pro, Arial, sans-serif',
};

const muiBrand = {
  primary: { main: '#1976d2' },
  secondary: { main: '#9c27b0' },
};

/**
 * MUI paints its surfaces from this JS theme, not from the palette's custom
 * properties, so theme-dark.css cannot reach them: the dark values are handed
 * over here. Shared so that every tree rendering MUI - the meeting and the
 * pre-flight, which mounts outside it - picks the same one.
 */
const muiThemes = {
  light: createTheme({ typography, palette: { ...muiBrand } }),
  dark: createTheme({
    typography,
    palette: {
      ...muiBrand,
      mode: 'dark',
      // --color-background and --color-white-surface of theme-dark.css.
      background: {
        default: '#181A23',
        paper: '#2D2F38',
      },
    },
  }),
};

export default muiThemes;
