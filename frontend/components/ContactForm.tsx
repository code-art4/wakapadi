// components/ContactForm.tsx
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import { api } from '../lib/api/index';

const initialForm = {
  name: '',
  email: '',
  type: 'inquiry',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      await api.post(`/contact`, { ...form });

      setStatus('Message sent!');
      setForm(initialForm);
    } catch (err) {
      setStatus('Failed to send');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 500, mx: 'auto', p: 3 }}
    >
      <Typography variant="h5" gutterBottom>
        Contact Us
      </Typography>
      <TextField
        label="Name"
        name="name"
        fullWidth
        required
        margin="normal"
        value={form.name}
        onChange={handleChange}
      />
      <TextField
        label="Email"
        name="email"
        fullWidth
        required
        margin="normal"
        value={form.email}
        onChange={handleChange}
      />
      <TextField
        select
        label="Type"
        name="type"
        fullWidth
        margin="normal"
        value={form.type}
        onChange={handleChange}
      >
        {['inquiry', 'complaint', 'feedback', 'suggestion', 'other'].map(
          (option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          )
        )}
      </TextField>
      <TextField
        label="Message"
        name="message"
        fullWidth
        required
        multiline
        rows={4}
        margin="normal"
        value={form.message}
        onChange={handleChange}
      />
      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Submit
      </Button>
      {status && (
        <Alert
          sx={{ mt: 2 }}
          severity={status.includes('fail') ? 'error' : 'success'}
        >
          {status}
        </Alert>
      )}
    </Box>
  );
}
