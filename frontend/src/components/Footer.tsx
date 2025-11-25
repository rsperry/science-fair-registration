import { Box, Container, Typography, Link, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFairMetadata } from '../services/api';

const Footer = () => {
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await getFairMetadata();
        setContactEmail(data.contactEmail);
        setError(false);
      } catch (error) {
        console.error('Failed to load metadata:', error);
        setError(true);
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
          {error ? (
            'Unable to load contact information'
          ) : (
            <>
              {loading ? <CircularProgress size={14} sx={{ ml: 1 }} /> : `For questions or assistance, please contact ${contactEmail}`}
            </>
          )}
          {' \u00A0·\u00A0 '}
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
