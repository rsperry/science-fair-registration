import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { projectId } = location.state || {};

  // If no data, redirect to home
  if (!projectId) {
    setTimeout(() => navigate('/'), 100);
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
          </Box>

          <Typography variant="h2" align="center" gutterBottom>
            Registration Successful!
          </Typography>

          <Box
            sx={{
              my: 4,
              p: 3,
              bgcolor: 'background.default',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            <Box sx={{ mt: 2 }}>            
            Thank you for registering your science fair project. Your registration has been confirmed.<br /><br />
            <b>Watch for an email after registration closes with further details on the project dropoff, family and friends showcase, and assigned project number.</b><br /><br />
            We look forward to seeing your project at the science fair!
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Confirmation;
