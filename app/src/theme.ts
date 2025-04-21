import { createTheme } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#e86a10', // Primary color from the Angular app
      light: '#ff8f3d',
      dark: '#c45100',
    },
    secondary: {
      main: '#76b900', // Secondary color (tier-green from the Angular app)
      light: '#8ed600',
      dark: '#5c8f00',
    },
    error: {
      main: '#c41e3a', // Ruby color from the Angular app
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: [
      'SouthwestSans',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '5px',
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
  },
});

export default theme;
