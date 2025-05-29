// src/pages/profile.tsx
import { useEffect, useState } from 'react';
import {
  Container, Typography, CircularProgress, ListItemAvatar,
  Avatar, Box, List, ListItem, ListItemText, Chip, Divider, Button,
  TextField, MenuItem, Select, OutlinedInput, Snackbar, Alert, IconButton
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person'
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';
import Layout from '../components/Layout';
import moment from 'moment-timezone';
import { api } from '../lib/api';

interface Conversation {
  _id: string;
  // message: string;
  createdAt: string;
  read: boolean;
  fromUserId: string;
  toUserId: string;
  message:{
    _id: string;
    message: string;
    createdAt: string;
    read: boolean;
    fromUserId: string;
    toUserId: string;
  },
  otherUser: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
}

const travelOptions = ['Adventure', 'Culture', 'Food Lover', 'Photography'];
const languageOptions = ['English', 'French', 'Spanish', 'German'];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [travelPrefs, setTravelPrefs] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

    console.log("currentUserId", currentUserId)
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await api.get('/users/preferences/' + currentUserId);
        setUser(userRes.data);

        setTravelPrefs(userRes.data.travelPrefs || []);
        setLanguages(userRes.data.languages || []);
        setInstagram(userRes.data.socials?.instagram || '');
        setTwitter(userRes.data.socials?.twitter || '');

        const convRes = await api.get('/whois/chat/inbox');
        console.log("con data", convRes.data)
        setConversations(convRes.data);

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
          path: '/socket.io',
          transports: ['websocket'],
          auth: { token: localStorage.getItem('token') || '' },
          withCredentials: true
        });

        newSocket.on('connect', () => {
          newSocket.emit('joinNotifications', { userId: currentUserId });
        });

        newSocket.on('notification:new', () => {
          fetchInbox();
        });

        newSocket.on('connect_error', (error) => {
          console.error("Socket connection error on Profile Page:", error);
        });

        setSocket(newSocket);

      } catch (err) {
        console.error('Error fetching profile or inbox on Profile Page:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchInbox = async () => {
      try {
        const convRes = await api.get('/whois/chat/inbox');
        setConversations(convRes.data);
      } catch (err) {
        console.error('Error refetching inbox:', err);
      }
    };

    fetchData();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleSaveChanges = async () => {
    try {
      await api.patch('/users/preferences', {
        travelPrefs,
        languages,
        socials: {
          instagram,
          twitter
        }
      });
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to save profile changes:', err);
    }
  };

  return (
    <Layout title="My Profile - Wakapadi">
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={2}>My Profile</Typography>

        {loading ? (
          <CircularProgress />
        ) : user ? (
          <Box mb={4}>
            <Typography variant="h6">Username: {user.username}</Typography>
            <Typography variant="body1">User ID: {user._id}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" mt={2}>Travel Preferences</Typography>
            <Select
              multiple
              fullWidth
              value={travelPrefs}
              onChange={(e) => setTravelPrefs(e.target.value as string[])}
              input={<OutlinedInput />}
              sx={{ mb: 2 }}
            >
              {travelOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>

            <Typography variant="h6" mt={3}>Languages Spoken</Typography>
            <Select
              multiple
              fullWidth
              value={languages}
              onChange={(e) => setLanguages(e.target.value as string[])}
              input={<OutlinedInput />}
              sx={{ mb: 2 }}
            >
              {languageOptions.map((lang) => (
                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
              ))}
            </Select>

            <Typography variant="h6" mt={3}>Safe Meet Preferences</Typography>
            <Box>
              <Typography variant="body2">✔ Only meet in public places</Typography>
              <Typography variant="body2">✔ Share location with a friend</Typography>
            </Box>

            <Typography variant="h6" mt={3}>Verification</Typography>
            <Box>
              <Chip label="Email Verified" color="success" sx={{ mr: 1 }} />
              <Chip label="Phone Verified" color="success" />
            </Box>

            <Typography variant="h6" mt={3}>Social Links</Typography>
            <TextField
              fullWidth
              label="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              sx={{ my: 1 }}
            />
            <TextField
              fullWidth
              label="Twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />

            <Button variant="contained" sx={{ mt: 3 }} onClick={handleSaveChanges}>Save Changes</Button>
          </Box>
        ) : (
          <Typography color="error">Failed to load user info.</Typography>
        )}

        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Typography variant="h6" mt={4}>People I've Chatted With</Typography>
        <List>
          {loading ? (
            <CircularProgress size={20} />
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <ListItem
                key={conv.message._id}
                sx={{ mb: 1, borderRadius: 1, flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <ListItemAvatar>
                    <Avatar src={conv.otherUser.avatarUrl || `https://i.pravatar.cc/40?u=${conv.otherUser._id}`} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Chat with ${conv.otherUser.username}`}
                    secondary={
                      <Typography component="span" variant="body2" color="text.secondary">
                        {conv.message.message} - {moment(conv.message.createdAt).fromNow()}
                      </Typography>
                    }
                  />
                  {/* <Button
                    variant="outlined"
                    size="small"
                    href={`/chat/${conv.toUserId}`}
                    sx={{ ml: 'auto' }}
                  >
                    Continue Chat
                  </Button> */}
                  <IconButton color="primary" href={`/chat/${conv.otherUser._id}`}><ChatIcon /></IconButton>
              <IconButton color="default" href={`/peer/${conv.otherUser._id}`}><PersonIcon /></IconButton>
                </Box>
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No recent conversations.</Typography>
          )}
        </List>
      </Container>
    </Layout>
  );
}
