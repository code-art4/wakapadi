import { useState } from 'react';
import { Box, Button, TextField, Typography, Stack, Snackbar } from '@mui/material';
import { api } from '../lib/api';

export default function CreateAssistantForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    languages: '',
    availability: '',
    experience: '',
    contactMethod: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/assistants', {
        ...form,
        languages: form.languages.split(',').map((l) => l.trim()),
      });
      setSuccess(true);
      setForm({
        name: '',
        location: '',
        languages: '',
        availability: '',
        experience: '',
        contactMethod: '',
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to create assistant', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" mb={2}>Become a Travel Assistant</Typography>
      <Stack spacing={2}>
        <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
        <TextField label="Location" name="location" value={form.location} onChange={handleChange} required />
        <TextField label="Languages (comma-separated)" name="languages" value={form.languages} onChange={handleChange} />
        <TextField label="Availability" name="availability" value={form.availability} onChange={handleChange} />
        <TextField label="Experience / Bio" name="experience" value={form.experience} onChange={handleChange} />
        <TextField label="Contact Method" name="contactMethod" value={form.contactMethod} onChange={handleChange} />
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Stack>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Assistant added!" />
    </Box>
  );
}
