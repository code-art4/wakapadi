import { useEffect, useState } from 'react';
import {
  Container, Typography, CircularProgress, ListItemAvatar,
  Avatar, Box, List, ListItem, ListItemText, Chip, Divider, Button,
  TextField, MenuItem, Select, OutlinedInput, Snackbar, Alert, IconButton
} from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Chat as ChatIcon, Person as PersonIcon } from '@mui/icons-material';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';
import Layout from '../components/Layout';
import moment from 'moment';
import { api } from '../lib/api/index';
import styles from '../styles/Profile.module.css';

interface User {
  _id: string;
  username: string;
  avatarUrl?: string;
  travelPrefs?: string[];
  languages?: string[];
  socials?: {
    instagram?: string;
    twitter?: string;
  };
}

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  message: {
    _id: string;
    message: string;
    createdAt: string;
  };
}

const travelOptions = ['Adventure', 'Culture', 'Food', 'Photography', 'Nature', 'Relaxation', 'City'];
const languageOptions = ['English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Japanese', 'Chinese'];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [travelPrefs, setTravelPrefs] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [notifications, setNotifications] = useState({
    success: '',
    error: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '';
        
        const [userRes, convRes] = await Promise.all([
          api.get(`/users/preferences/${userId}`), // Original endpoint
          api.get('/whois/chat/inbox') // Original endpoint
        ]);

        setUser(userRes.data);
        setTravelPrefs(userRes.data.travelPrefs || []);
        setLanguages(userRes.data.languages || []);
        setInstagram(userRes.data.socials?.instagram || '');
        setTwitter(userRes.data.socials?.twitter || '');
        setConversations(convRes.data);

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
          auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('newMessage', () => {
          api.get('/conversations').then(res => setConversations(res.data));
        });

        setSocket(newSocket);
      } catch (error) {
        setNotifications(prev => ({ ...prev, error: 'Failed to load profile data' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleSave = async () => {
    try {
     await api.patch('/users/preferences', {
        travelPrefs,
        languages,
        socials: { instagram, twitter }
      });
      setNotifications({
        success: 'Profile updated successfully!',
        error: ''
      });
    } catch (error) {
      setNotifications({
        success: '',
        error: 'Failed to update profile'
      });
    }
  };

  const closeNotification = () => {
    setNotifications({ success: '', error: '' });
  };

  return (
    <Layout title="My Profile">
      <Container maxWidth="md" className={styles.container}>
        {/* Profile Header */}
        <Box className={styles.header}>
          <Typography variant="h4" className={styles.title}>
            My Profile
          </Typography>
          {user && (
            <Box className={styles.userInfo}>
              <Avatar
                src={user.avatarUrl || `/default-avatar.png`}
                className={styles.avatar}
              />
              <Typography variant="h6" className={styles.username}>
                {user.username}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Main Content */}
        {loading ? (
          <Box className={styles.loading}>
            <CircularProgress />
          </Box>
        ) : user ? (
          <>
            {/* Preferences Section */}
            <Box className={styles.section}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Preferences
              </Typography>
              
              <Box mb={3}>
                <Typography>Travel Interests</Typography>
                <Select
                  multiple
                  value={travelPrefs}
                  onChange={(e) => setTravelPrefs(e.target.value as string[])}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  fullWidth
                >
                  {travelOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box mb={3}>
                <Typography>Languages</Typography>
                <Select
                  multiple
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value as string[])}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  fullWidth
                >
                  {languageOptions.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>

            {/* Social Media Section */}
            <Box className={styles.section}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Social Media
              </Typography>
              <TextField
                label="Instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <Typography mr={1}>@</Typography>,
                }}
              />
              <TextField
                label="Twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <Typography mr={1}>@</Typography>,
                }}
              />
            </Box>

            {/* Save Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              className={styles.saveButton}
            >
              Save Changes
            </Button>

            {/* Conversations Section */}
            <Box className={styles.section}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Recent Chats
              </Typography>
              <List className={styles.conversationList}>
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <ListItem key={conv._id} className={styles.conversationItem}>
                      <ListItemAvatar>
                        <Avatar src={conv.otherUser.avatarUrl} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={conv.otherUser.username}
                        secondary={
                          <>
                            <Typography component="span">
                              {conv.message.message}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {moment(conv.message.createdAt).fromNow()}
                            </Typography>
                          </>
                        }
                      />
                      <IconButton
                        component={Link}
                        href={`/chat/${conv.otherUser._id}`}
                      >
                        <ChatIcon />
                      </IconButton>
                    </ListItem>
                  ))
                ) : (
                  <Typography>No conversations yet</Typography>
                )}
              </List>
            </Box>
          </>
        ) : (
          <Typography color="error">Failed to load profile</Typography>
        )}

        {/* Notifications */}
        <Snackbar
          open={!!notifications.success}
          autoHideDuration={6000}
          onClose={closeNotification}
        >
          <Alert severity="success">{notifications.success}</Alert>
        </Snackbar>
        <Snackbar
          open={!!notifications.error}
          autoHideDuration={6000}
          onClose={closeNotification}
        >
          <Alert severity="error">{notifications.error}</Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}