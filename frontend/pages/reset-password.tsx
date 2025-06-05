// pages/reset-password.tsx
import { SetStateAction, useState } from 'react';
import { Container, TextField, Typography, Button, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import { api } from '../lib/api/index';
import Layout from '../components/Layout';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid or missing token.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      setMessage(
        res.data.message || 'Password reset successful. You can now log in.'
      );
      setPassword('');
      setConfirm('');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Failed to reset password. The link may have expired.');
    }
  };

  return (
    <Layout title="Reset Password - Wakapadi">
      <Container
        maxWidth="sm"
        sx={{ mt: 6, p: 4, boxShadow: 3, borderRadius: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter and confirm your new password.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setPassword(e.target.value)
            }
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={confirm}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setConfirm(e.target.value)
            }
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
            Reset Password
          </Button>
        </form>
      </Container>
    </Layout>
  );
}
