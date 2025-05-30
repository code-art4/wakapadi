import { useState, useEffect } from 'react';
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
import styles from '../styles/AuthPage.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Effect to capture the 'from' query parameter on component mount
  useEffect(() => {
    // Check if there's a 'from' query parameter (e.g., /auth?from=/dashboard)
    if (router.query.from) {
      localStorage.setItem('lastPageBeforeLogin', router.query.from as string);
    }
  }, [router.query.from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSuccessfulAuth = () => {
    const lastPage = localStorage.getItem('lastPageBeforeLogin');
    if (lastPage) {
      router.push(lastPage);
      localStorage.removeItem('lastPageBeforeLogin'); // Clean up after use
    } else {
      router.push('/whois'); // Default route
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, username, password } = form;

    setError('');

    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && !agreeTerms) {
      setError('You must agree to the terms.');
      return;
    }

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const res = await api.post(`/auth/${endpoint}`, { email, username, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      handleSuccessfulAuth();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google/token', { 
        idToken: credentialResponse.credential 
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      handleSuccessfulAuth();
    } catch (err) {
      setError('Google login failed. Please try another method.');
    }
  };

  return (
    <Container maxWidth="sm" className={styles.authContainer}>
      <Typography variant="h4" className={styles.title}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Typography>

      <Typography variant="body1" className={styles.subtitle}>
        {isLogin ? 'Sign in to continue' : 'Join our community'}
      </Typography>

      {/* Google Login First */}
      <Box className={styles.googleButtonContainer}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          theme="filled_blue"
          size="large"
          width="100%"
        />
      </Box>

      <Divider className={styles.divider}>OR</Divider>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        {!isLogin && (
          <TextField
            fullWidth
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        )}

        <TextField
          fullWidth
          type="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          className={styles.inputField}
          required
        />

        {!isLogin && (
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <span className={styles.termsText}>
                I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>
              </span>
            }
            className={styles.termsCheckbox}
          />
        )}

        {error && (
          <Alert severity="error" className={styles.errorAlert}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          className={styles.submitButton}
        >
          {isLogin ? 'Login with Email' : 'Sign Up with Email'}
        </Button>
      </form>

      <Box className={styles.switchAuthMode}>
        <Typography variant="body2">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <Link 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className={styles.authModeLink}
          >
            {isLogin ? ' Sign Up' : ' Login'}
          </Link>
        </Typography>

        {isLogin && (
          <Link href="/forgot-password" className={styles.forgotPassword}>
            Forgot password?
          </Link>
        )}
      </Box>
    </Container>
  );
}