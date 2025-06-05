// pages/forgot-password.tsx
import { SetStateAction, useState } from 'react';
import { Container, TextField, Typography, Button, Alert } from '@mui/material';
import { api } from '../lib/api/index';
import Layout from '../components/Layout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(
        res.data.message ||
          'If your email exists, reset instructions have been sent.'
      );
      setEmail('');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset email. Try again.');
    }
  };

  return (
    <Layout title="Reset Password - Wakapadi">
      <Container
        maxWidth="sm"
        sx={{ mt: 6, p: 4, boxShadow: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Forgot your password?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your email and we’ll send you instructions to reset your
          password.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            Send Reset Link
          </Button>
        </form>
      </Container>
    </Layout>
  );
}
