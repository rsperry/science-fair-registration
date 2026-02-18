import { Container, Box, Typography, Button, Paper, CircularProgress, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScienceIcon from '@mui/icons-material/Science';
import { useMetadata } from '../contexts/MetadataContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { metadata, loading, error, refetch } = useMetadata();

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
          {error ? (
            <Box>
              <Typography variant="h4" color="error" align="center" gutterBottom>
                Error Loading Information
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={refetch}
                >
                  Retry
                </Button>
              </Box>
            </Box>
          ) : (
            <>
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
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Important Dates
                </Typography>
                <Typography variant="body1" paragraph>
                  • Registration Deadline: {loading ? <CircularProgress size={14} sx={{ ml: 1 }} /> : formatDate(metadata.registrationDeadline)}<br />
                  • Showcase for Family & Friends: {loading ? <CircularProgress size={14} sx={{ ml: 1 }} /> : formatDate(new Date(new Date(metadata.scienceFairDate).getTime() - 24 * 60 * 60 * 1000).toISOString())}<br />
                  • Science Fair Event: {loading ? <CircularProgress size={14} sx={{ ml: 1 }} /> : formatDate(metadata.scienceFairDate)}
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Reminders and Guidelines
                </Typography>
                <Typography variant="body1" paragraph>
                  The Washington Science Fair is open to all students and we want it to be a positive experience for everyone!
                </Typography>
                <Typography variant="body1" paragraph>
                  • Projects can be individual or group (up to 4 students)<br />
                  • All students must have parent/guardian consent<br />
                  • Projects can be an experiment, demonstration, model or diagram, collection, or report<br />
                  • Most students find it helpful to display their project on a tri-fold board, but this is not required<br />
                  • Any messy projects must be contained to prevent spills<br />
                  • All projects must be latex-free<br />
                  • When possible, projects should follow the scientific method<br />
                  • Students should be prepared to present their findings to an adult judge<br />
                  • All students will receive a participation ribbon and feedback on a review form
                </Typography>
                
                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Review Criteria
                </Typography>
                <Typography variant="body1" paragraph>
                  All projects will be evaluated based on the following criteria depending on project type:
                </Typography>
                <Typography variant="body1" component="div" paragraph>
                  • Project title<br />
                  • Experiment: hypothesis stated<br />
                  • Demonstration: picture, drawing, or description of procedure included<br />
                  • Experiment/Demonstration: results, discussion, or conclusion included<br />
                  • Model: clear what the model represents<br />
                  • Report: data recorded<br />
                  • Collection: items neatly labeled<br />
                  • Evidence of research (at least 2 sources)<br />
                  • Display organization<br />
                  • Explanation of what was learned
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                {loading ? (
                  <CircularProgress />
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
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Welcome;
