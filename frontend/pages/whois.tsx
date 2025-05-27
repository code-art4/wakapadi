import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Switch,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { api } from '../lib/api';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import Layout from '../components/Layout';

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  {
    query: {
      token: typeof window !== 'undefined' ? localStorage.getItem('token') : '',
    },
    autoConnect: true,
  }
);

type NearbyUser = {
  _id: string;
  userId?: string;
  username?: string;
  city: string;
  lastSeen: string;
  anonymous?: boolean;
};

export default function WhoisPage() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [city, setCity] = useState('');
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const router = useRouter();

  const isLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('token');
    const userId = typeof window !== 'undefined' &&  localStorage.getItem('userId')
  const fetchNearby = async (targetCity: string) => {
    try {
      const res = await api.get('/whois/nearby', {
        params: { city: targetCity, userId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('❌ Fetch nearby failed:', err);
    }
  };

  const pingPresence = async (targetCity: string) => {
    try {
      const res = await api.post('/whois/ping', { city: targetCity });
      if (res.status === 201) {
        await fetchNearby(targetCity);
      }
    } catch (err) {
      console.error('❌ Ping presence failed:', err);
    }
  };

  const togglePresence = async () => {
    if (visible) {
      await api.delete('/whois');
    } else {
      await pingPresence(city);
    }
    setVisible(!visible);
  };

  useEffect(() => {
    const detectCityAndLoad = async () => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Geolocation timed out after 10s');
        setLoading(false);
      }, 10000);

      try {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            clearTimeout(timeout);
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
              );
              const geocode = await res.json();
              const detectedCity =
                (geocode.address.city || geocode.address.town || '').trim().toLowerCase();

              console.log('📍 Detected city:', detectedCity);
              setCity(detectedCity);

              if (isLoggedIn) await pingPresence(detectedCity);
              await fetchNearby(detectedCity);
            } catch (geoErr) {
              console.error('❌ Geocoding failed:', geoErr);
            } finally {
              setLoading(false);
            }
          },
          (geoErr) => {
            clearTimeout(timeout);
            console.error('❌ Geolocation error:', geoErr);
            setLoading(false);
          }
        );
      } catch (err) {
        clearTimeout(timeout);
        console.error('❌ Unexpected error in geolocation flow:', err);
        setLoading(false);
      }
    };

    detectCityAndLoad();
  }, []);

  return (
    <Layout title="#Whois Page - Wakapadi">
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={2}>
        #whois Nearby
      </Typography>

      {isLoggedIn ? (
        <Box display="flex" alignItems="center" mb={2}>
          <Typography mr={2}>Visible to others:</Typography>
          <Switch checked={visible} onChange={togglePresence} />
        </Box>
      ) : (
        <Box mb={3}>
          <Typography variant="body1" mb={1}>
            Want to be seen or connect with people nearby?
          </Typography>
          <Button variant="contained" onClick={() => router.push('/login')}>
            Login to Connect
          </Button>
        </Box>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {users.map((user) => (
            <Box key={user._id}>
              <ListItem
                secondaryAction={
                  isLoggedIn &&
                  !user.anonymous &&
                  user.userId && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/chat/${user.userId}`)}
                    >
                      💬 Chat
                    </Button>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      {user.anonymous ? '👤 Anonymous' : `👤 ${user.username}`}
                      <Box
                        ml={1}
                        width={8}
                        height={8}
                        bgcolor="green"
                        borderRadius="50%"
                      />
                    </Box>
                  }
                  secondary={`Last seen: ${
                    user.lastSeen
                      ? new Date(user.lastSeen).toLocaleTimeString()
                      : 'Unknown'
                  }`}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}
    </Container>
    </Layout>
  );
}
