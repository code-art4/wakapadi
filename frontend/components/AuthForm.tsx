import { useState } from 'react';
import {
  Container, TextField, Button, Typography, Checkbox,
  FormControlLabel, Link, Box
} from '@mui/material';
import { api } from '../lib/api';
import { useRouter } from 'next/router';

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

    if (!email || !password || (!isLogin && !username)) {
      setError('All fields are required.');
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
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Authentication failed.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        {isLogin ? 'Login' : 'Sign Up'}
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        name="email"
        label="Email"
        value={form.email}
        onChange={handleChange}
      />

      {!isLogin && (
        <TextField
          fullWidth
          margin="normal"
          name="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
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
      />

      {!isLogin && (
        <FormControlLabel
          control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />}
          label="I agree to the terms and conditions"
        />
      )}

      {error && <Typography color="error">{error}</Typography>}

      <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
        {isLogin ? 'Login' : 'Sign Up'}
      </Button>

      <Box mt={2}>
        <Typography>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link component="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </Typography>
        {isLogin && (
          <Typography mt={1}>
            <Link href="#" underline="hover">Forgot password?</Link>
          </Typography>
        )}
      </Box>
    </Container>
  );
}
