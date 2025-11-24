import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ScienceIcon from '@mui/icons-material/Science';
import { getFairMetadata } from '../services/api';

const Welcome = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({
    school: 'School',
    contactEmail: 'sciencefair@school.edu',
    registrationDeadline: 'December 15, 2025',
    scienceFairDate: 'February 10, 2026',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await getFairMetadata();
        setMetadata(data);
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if not a valid date
      }
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString; // Return original on error
    }
  };

  const isRegistrationClosed = (): boolean => {
    try {
      const deadline = new Date(metadata.registrationDeadline);
      if (isNaN(deadline.getTime())) {
        return false; // If invalid date, allow registration
      }
      const now = new Date();
      // Set deadline to end of day (11:59:59 PM)
      deadline.setHours(23, 59, 59, 999);
      return now > deadline;
    } catch {
      return false; // On error, allow registration
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            <ScienceIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h1" align="center">
              {loading ? '' : `${metadata.school} `}Science Fair Registration
            </Typography>
          </Box>
          
          {/* <Typography variant="h3" align="center" color="text.secondary" gutterBottom>
            Welcome!
          </Typography> */}

          <Box sx={{ my: 4 }}>
            <Typography variant="body1" paragraph>
              Welcome to the {loading ? '' : `${metadata.school} `} Science Fair registration portal! Please review the following information before registering your project.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Important Dates
            </Typography>
            <Typography variant="body1" paragraph>
              • Registration Deadline: {loading ? 'Loading...' : formatDate(metadata.registrationDeadline)}<br />
              • Science Fair Event: {loading ? 'Loading...' : formatDate(metadata.scienceFairDate)}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Rules and Guidelines
            </Typography>
            <Typography variant="body1" paragraph>
              • Projects can be individual or group (up to 4 students)<br />
              • All students must have parent/guardian consent<br />
              • Projects must follow the scientific method<br />
              • No live vertebrate animals or hazardous materials<br />
              • Students must be prepared to present their findings
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {loading ? (
              <Typography variant="body1" color="text.secondary">
                Loading...
              </Typography>
            ) : isRegistrationClosed() ? (
              <Typography variant="h6" color="error" align="center">
                Registration closed on {formatDate(metadata.registrationDeadline)}
              </Typography>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 6, py: 1.5 }}
              >
                Register Your Project
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Welcome;
