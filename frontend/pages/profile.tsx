import { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { api } from '../lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={2}>My Profile</Typography>
      {loading ? (
        <CircularProgress />
      ) : user ? (
        <>
          <Typography variant="h6">Username: {user.username}</Typography>
          <Typography variant="body1">User ID: {user._id}</Typography>
        </>
      ) : (
        <Typography color="error">Failed to load user info.</Typography>
      )}
    </Container>
  );
}
