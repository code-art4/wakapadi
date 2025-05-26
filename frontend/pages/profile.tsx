import { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress } from '@mui/material';
import { api } from '../lib/api';
import { List, ListItem, ListItemText, Avatar } from '@mui/material';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState([]);

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

    const fetchInbox = async () => {
      const res = await api.get('/whois/chat/inbox');
      setConversations(res.data);
    };
    fetchInbox();

    const socket =  io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') || '' },
      withCredentials: true
    });
    
    socket.on('notification:new', (data) => {
      console.log("data", data)
      // show toast/snackbar or update bell icon
    });
    return () => socket.disconnect();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={2}>
        My Profile
      </Typography>
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

      <Typography variant="h6" mt={4}>
        Recent Conversations
      </Typography>
      <List>
        {conversations.map((conv) => (
          <ListItem
            key={conv._id}
            component={Link}
            href={`/chat/${
              conv.fromUserId === user._id ? conv.toUserId : conv.fromUserId
            }`}
            button
          >
            <Avatar
              src={`https://i.pravatar.cc/40?u=${
                conv.fromUserId === user._id ? conv.toUserId : conv.fromUserId
              }`}
            />
            <ListItemText
              primary={`Chat with ${
                conv.fromUserId === user._id ? conv.toUserId : conv.fromUserId
              }`}
              secondary={conv.message}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
