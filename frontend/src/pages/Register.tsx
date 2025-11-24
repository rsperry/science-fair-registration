import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import RegistrationForm from '../components/RegistrationForm';
import { getFairMetadata } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await getFairMetadata();
        setSchoolName(data.school);
        setRegistrationDeadline(data.registrationDeadline);
        setContactEmail(data.contactEmail);
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  const isRegistrationClosed = (): boolean => {
    try {
      const deadline = new Date(registrationDeadline);
      if (isNaN(deadline.getTime())) {
        return false;
      }
      const now = new Date();
      deadline.setHours(23, 59, 59, 999);
      return now > deadline;
    } catch {
      return false;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h2" align="center" gutterBottom>
            {loading ? '' : `${schoolName} `}Science Fair Project Registration
          </Typography>
          
          {loading ? (
            <Typography variant="body1" align="center" color="text.secondary" paragraph>
              Loading...
            </Typography>
          ) : isRegistrationClosed() ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" color="error" gutterBottom>
                Registration Closed
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Registration closed on {formatDate(registrationDeadline)}.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please contact {contactEmail || 'sciencefair@school.edu'} if you have questions.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="body1" align="center" color="text.secondary" paragraph>
                Complete the form below to register your science fair project.
              </Typography>

              <RegistrationForm />
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
