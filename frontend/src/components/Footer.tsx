import { Box, Container, Typography, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFairMetadata } from '../services/api';

const Footer = () => {
  const [contactEmail, setContactEmail] = useState('sciencefair@school.edu');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await getFairMetadata();
        setContactEmail(data.contactEmail);
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="text.secondary" align="center">
          For questions or assistance, please contact:{' '}
          {loading ? 'sciencefair@school.edu' : contactEmail}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <Link
            component={RouterLink}
            to="/privacy"
            color="inherit"
            underline="hover"
          >
            Privacy Policy
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
