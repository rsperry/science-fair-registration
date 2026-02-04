import { Box, Container, Typography, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useMetadata } from '../contexts/MetadataContext';

const Footer = () => {
  const { metadata, loading, error } = useMetadata();
  const contactEmail = metadata.contactEmail;

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
