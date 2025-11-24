import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { projectId, timestamp } = location.state || {};

  // If no data, redirect to home
  if (!projectId) {
    setTimeout(() => navigate('/'), 100);
    return null;
  }

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : '';

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

          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Thank you for registering your science fair project. Your registration has been confirmed.
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
            <Typography variant="h6" gutterBottom>
              Registration Details
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Project ID:</strong> {projectId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Registration Date:</strong> {formattedDate}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            You will receive a confirmation email shortly with next steps and additional information about the science fair.
          </Typography>

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
