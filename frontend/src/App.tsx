import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Confirmation from './pages/Confirmation';
import Privacy from './pages/Privacy';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Router>
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/register" element={<Register />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </Box>
          <Footer />
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
