import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Box,
  Divider,
  Alert,
} from '@mui/material';
import { api } from '../lib/api';
import { useRouter } from 'next/router';
import { GoogleLogin } from '@react-oauth/google';
// import jwt_decode from 'jwt-decode';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { email, username, password } = form;

    setError(''); // clear old errors

    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && !agreeTerms) {
      setError('You must agree to the terms.');
      return;
    }

    try {
      const payload = isLogin
        ? { email, password }
        : { email, username, password };
      const endpoint = isLogin ? 'login' : 'register';

      const res = await api.post(`/auth/${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    setError('');

    try {
      const res = await api.post('/auth/google/token', { idToken });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Google login failed.');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 6, py: 4, px: 3, borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        {isLogin ? 'Welcome Back 👋' : 'Create Your Account'}
      </Typography>

      <Typography variant="body1" align="center" color="textSecondary" mb={2}>
        {isLogin ? 'Please login to continue' : 'Sign up to get started'}
      </Typography>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <TextField
          fullWidth
          margin="normal"
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <TextField
            fullWidth
            margin="normal"
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
        )}

        <TextField
          fullWidth
          margin="normal"
          type="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {!isLogin && (
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
            }
            label="I agree to the terms and conditions"
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </form>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
          <Link component="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </Typography>

        {isLogin && (
          <Typography mt={1}>
            <Link href="/forgot-password" underline="hover">
              Forgot password?
            </Link>
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }}>OR</Divider>

      <Box mt={1} textAlign="center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Sign-in failed')}
        />
      </Box>
    </Container>
  );
}
