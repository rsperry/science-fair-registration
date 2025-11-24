import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { useEffect, useState } from 'react';
import { getFairMetadata } from '../services/api';

const Privacy = () => {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({
    school: 'School',
    contactEmail: 'sciencefair@school.edu',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await getFairMetadata();
        setMetadata({
          school: data.school,
          contactEmail: data.contactEmail,
        });
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetadata();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h2" align="center" gutterBottom>
            Privacy Policy
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            This privacy policy explains how the {loading ? '' : `${metadata.school} `} PTA collects, uses, and protects information 
            provided during the science fair registration process.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            When you register for the science fair, we collect the following information:
          </Typography>
          <Box sx={{ pl: 4 }}>
            <Typography variant="body1" component="div" paragraph>
              Student Information:
              <ul style={{ paddingLeft: '2rem' }}>
                <li>Student name(s)</li>
                <li>Teacher name(s)</li>
                <li>Grade level(s)</li>
                <li>Project name (optional)</li>
              </ul>
            </Typography>
            <Typography variant="body1" component="div" paragraph>
              Parent/Guardian Information:
              <ul style={{ paddingLeft: '2rem' }}>
                <li>Parent/Guardian name(s)</li>
                <li>Parent/Guardian email address(es)</li>
              </ul>
            </Typography>
            <Typography variant="body1" component="div" paragraph>
              Administrative Data:
              <ul style={{ paddingLeft: '2rem' }}>
                <li>Project ID (automatically assigned)</li>
                <li>Registration timestamp</li>
              </ul>
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            The information collected is used solely for science fair administration purposes, including:
          </Typography>
          <Typography variant="body1" component="ul" paragraph sx={{ paddingLeft: '2rem' }}>
            <li>Processing and managing science fair project registrations</li>
            <li>Communicating with students, parents, and teachers about the science fair event</li>
            <li>Organizing and coordinating science fair activities</li>
            <li>Maintaining records for the current science fair event</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Data Sharing and Disclosure
          </Typography>
          <Typography variant="body1" paragraph>
            Your registration information will be shared only with:
          </Typography>
          <Typography variant="body1" component="ul" paragraph sx={{ paddingLeft: '2rem' }}>
            <li>Authorized school staff members</li>
            <li>Science fair organizers, coordinators, and volunteers</li>
            <li>Teachers associated with participating students</li>
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or otherwise transfer your personal information to third parties outside of the 
            science fair administration team.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information from unauthorized access, 
            alteration, disclosure, or destruction. Registration data is stored securely and access is limited to 
            authorized personnel only.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            Registration information is retained for the duration of the current science fair event and may be kept for archival purposes.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <Typography variant="body1" component="ul" paragraph sx={{ paddingLeft: '2rem' }}>
            <li>Request access to the personal information we have collected about you</li>
            <li>Request correction of any inaccurate information</li>
            <li>Request deletion of your registration information</li>
            <li>Withdraw consent for data processing</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Consent
          </Typography>
          <Typography variant="body1" paragraph>
            By submitting a registration form, you consent to the collection, use, and storage of the information 
            provided as described in this privacy policy.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have questions about this privacy policy, wish to exercise your rights, or need to request 
            data deletion, please contact us at:{' '}
            <strong>{loading ? 'sciencefair@school.edu' : metadata.contactEmail}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }} paragraph>
            Last updated: November 2025
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

export default Privacy;
