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
  Paper
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5
    }
  })
};

export default function WhoisPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [city, setCity] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    setIsLoggedIn(!!token);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const fetchNearby = async (targetCity) => {
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

  const pingPresence = async (targetCity) => {
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
    await api.patch('/whois', { visible: !visible });
    setVisible(!visible);
  };

  useEffect(() => {
    if (!hasMounted) return;

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
  }, [hasMounted, isLoggedIn]);

  if (!hasMounted) return null;

  return (
    <Layout title="#Whois Nearby – Wakapadi">
      <Head>
        <title>#Whois Nearby – Wakapadi</title>
        <meta name="description" content="Discover travelers near you with Wakapadi’s #whois feature. See who’s around and connect instantly." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="#Whois Nearby – Wakapadi" />
        <meta property="og:description" content="Meet fellow travelers nearby. Check who's around and connect instantly via secure chat." />
        <meta property="og:image" content="https://wakapadi.com/og-image-whois.jpg" />
        <meta property="og:url" content="https://wakapadi.com/whois" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="#Whois Nearby – Wakapadi" />
        <meta name="twitter:description" content="Connect with other travelers nearby with Wakapadi’s real-time presence feature." />
        <meta name="twitter:image" content="https://wakapadi.com/og-image-whois.jpg" />
      </Head>

      <Container sx={{ mt: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Paper elevation={3} sx={{ p: 4 }}>
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
                {users.map((user, index) => (
                  <motion.div key={user._id} variants={fadeInUp} custom={index + 1}>
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
                            ? formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })
                            : 'Unknown'
                        }`}
                      />
                    </ListItem>
                    <Divider />
                  </motion.div>
                ))}
              </List>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Layout>
  );
}