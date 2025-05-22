import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import { api } from '../lib/api';

type NearbyUser = {
  username: string;
  lat: number;
  lng: number;
  lastSeen: string;
};

export default function WhoisPage() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [users, setUsers] = useState<NearbyUser[]>([]);

  const fetchNearbyUsers = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await api.get('/whois', { params: { lat, lng } });
      setUsers(res.data);
    } catch (e) {
      console.error('Failed to fetch nearby users:', e);
    }
    setLoading(false);
  };

  const handleFindNearby = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });

      api.post('/whois/ping', {
        userId: 'browser-user-123', // can make dynamic later
        username: 'BrowserUser',
        lat: latitude,
        lng: longitude,
      });

      fetchNearbyUsers(latitude, longitude);
    });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={2}>
        #whois Nearby
      </Typography>

      <Button variant="contained" onClick={handleFindNearby}>
        Find Nearby Users
      </Button>

      {loading && <CircularProgress sx={{ mt: 2 }} />}

      <Box mt={3}>
        {users.map((user, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Typography>
              👤 <strong>{user.username}</strong> (last seen: {new Date(user.lastSeen).toLocaleTimeString()})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lat: {user.lat}, Lng: {user.lng}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
