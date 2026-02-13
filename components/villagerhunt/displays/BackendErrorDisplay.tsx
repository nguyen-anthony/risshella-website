"use client";
import { Alert, Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface BackendErrorDisplayProps {
  error?: Error | null;
  message?: string;
}

export default function BackendErrorDisplay({ error, message }: BackendErrorDisplayProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderTop: 4,
          borderColor: 'error.main'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <ErrorOutlineIcon 
            sx={{ 
              fontSize: { xs: 64, md: 80 }, 
              color: 'error.main',
              opacity: 0.9 
            }} 
          />
          
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700}
            color="error.main"
          >
            Service Temporarily Unavailable
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: 500 }}
          >
            {message || 
              "We're experiencing issues connecting to our backend services. This is likely a temporary issue with our database provider. Please check back later."}
          </Typography>

          {error && process.env.NODE_ENV === 'development' && (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Error Details (Development Only):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                {error.message}
              </Typography>
            </Alert>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="large"
            >
              Try Again
            </Button>
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              If this problem persists, please check back later or contact support.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
