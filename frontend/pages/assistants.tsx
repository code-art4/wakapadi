import { useEffect, useState } from 'react';
import { Container, Typography, TextField, Box } from '@mui/material';
import AssistantCard from '../components/AssistantCard';
import CreateAssistantForm from '../components/CreateAssistantForm';
import { api } from '../lib/api/index';

type Assistant = {
  name: string;
  location: string;
  languages: string[];
  availability?: string;
  experience?: string;
  contactMethod?: string;
};

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [search, setSearch] = useState('');

  const fetchAssistants = async (query?: string) => {
    const res = await api.get('/assistants', {
      params: query ? { location: query } : {},
    });
    setAssistants(res.data);
  };

  useEffect(() => {
    fetchAssistants(search);
  }, [search]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Find a Travel Assistant
      </Typography>

      <TextField
        label="Filter by Location"
        variant="outlined"
        fullWidth
        sx={{ mb: 4 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <CreateAssistantForm onSuccess={() => fetchAssistants(search)} />

      <Box>
        {assistants.map((a, i) => (
          <AssistantCard key={i} {...a} />
        ))}
      </Box>
    </Container>
  );
}
