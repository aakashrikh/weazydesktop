import { createTheme, ThemeProvider } from '@mui/material/styles';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-responsive-modal/styles.css';
import { HashRouter } from 'react-router-dom';
import 'react-tabs/style/react-tabs.css';
import 'rsuite/dist/rsuite-no-reset.min.css';
import App from './App';

const theme = createTheme({
  typography: {
    fontFamily: `"Poppins", "sans-serif"`,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <HashRouter>
      <App />
    </HashRouter>
  </ThemeProvider>
);
