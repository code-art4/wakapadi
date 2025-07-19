import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  ListItemAvatar,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  OutlinedInput,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Chat as ChatIcon } from '@mui/icons-material';
import Link from 'next/link';
import io, { Socket } from 'socket.io-client';
import Layout from '../components/Layout';
import moment from 'moment';
import { api } from '../lib/api/index';
import styles from '../styles/Profile.module.css';
import { StringNullableChain } from 'lodash';

interface User {
  _id: string;
  username: string;
  avatarUrl?: string;
  travelPrefs?: string[];
  languages?: string[];
  bio?: StringNullableChain;
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

const travelOptions = [
  'Adventure',
  'Culture',
  'Food',
  'Photography',
  'Nature',
  'Relaxation',
  'City',
];
const languageOptions = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Portuguese',
  'Japanese',
  'Chinese',
];

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
    error: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '';

        const [userRes, convRes] = await Promise.all([
          api.get(`/users/preferences/${userId}`), // Original endpoint
          api.get('/whois/chat/inbox'), // Original endpoint
        ]);

        setUser(userRes.data);
        setTravelPrefs(userRes.data.travelPrefs || []);
        setLanguages(userRes.data.languages || []);
        setInstagram(userRes.data.socials?.instagram || '');
        setTwitter(userRes.data.socials?.twitter || '');
        setConversations(convRes.data);

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
          auth: { token: localStorage.getItem('token') },
        });

        newSocket.on('newMessage', () => {
          api.get('/conversations').then((res) => setConversations(res.data));
        });

        setSocket(newSocket);
      } catch (error) {
        console.log('error', error);
        setNotifications((prev) => ({
          ...prev,
          error: 'Failed to load profile data',
        }));
      } finally {
        setLoading(false);
      }
    })();

    // fetchData();

    return () => {
      socket?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      await api.patch('/users/preferences', {
        travelPrefs,
        languages,
        socials: { instagram, twitter },
      });
      setNotifications({
        success: 'Profile updated successfully!',
        error: '',
      });
    } catch (error) {
      console.error('error', error);
      setNotifications({
        success: '',
        error: 'Failed to update profile',
      });
    }
  };

  const closeNotification = () => {
    setNotifications({ success: '', error: '' });
  };

  return (
    <Layout title='My Profile'>
      <Container maxWidth='md' className={styles.container}>
        {/* Profile Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          {user && (
            <div className={styles.userInfo}>
              <Avatar
                src={user.avatarUrl || `/default-avatar.png`}
                alt={`${user.username}'s avatar`}
                className={styles.avatar}
              />
              <h2 className={styles.username}>{user.username}</h2>
              {/* Add a short bio or tagline here if available from API */}
              {/* {user.bio && <div><p className={styles.userBio}>{user.bio}.</p></div>} */}
            </div>
          )}
        </header>

        {/* Main Content */}
        {loading ? (
          <div className={styles.loading} role='status' aria-live='polite'>
            <CircularProgress aria-label='Loading profile data' />
            <p>Loading your profile...</p>
          </div>
        ) : user ? (
          <main>
            {/* Preferences Section */}
            <section
              className={styles.section}
              aria-labelledby='preferences-heading'
            >
              <h2 id='preferences-heading' className={styles.sectionTitle}>
                Preferences
              </h2>

              <div className={styles.formGroup}>
                <label htmlFor='travel-interests' className={styles.formLabel}>
                  Travel Interests
                </label>
                <Select
                  multiple
                  value={travelPrefs}
                  onChange={(e) => setTravelPrefs(e.target.value as string[])}
                  input={<OutlinedInput id='travel-interests' />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          onDelete={() =>
                            setTravelPrefs((prev) =>
                              prev.filter((item) => item !== value)
                            )
                          }
                          aria-label={`Remove ${value}`}
                        />
                      ))}
                    </Box>
                  )}
                  fullWidth
                  aria-describedby='travel-interests-help'
                >
                  {travelOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <p id='travel-interests-help' className={styles.helperText}>
                  Select your preferred travel activities.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor='languages' className={styles.formLabel}>
                  Languages
                </label>
                <Select
                  multiple
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value as string[])}
                  input={<OutlinedInput id='languages' />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          onDelete={() =>
                            setLanguages((prev) =>
                              prev.filter((item) => item !== value)
                            )
                          }
                          aria-label={`Remove ${value}`}
                        />
                      ))}
                    </Box>
                  )}
                  fullWidth
                  aria-describedby='languages-help'
                >
                  {languageOptions.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
                <p id='languages-help' className={styles.helperText}>
                  Indicate the languages you speak.
                </p>
              </div>
            </section>

            {/* Social Media Section */}
            <section
              className={styles.section}
              aria-labelledby='social-media-heading'
            >
              <h2 id='social-media-heading' className={styles.sectionTitle}>
                Social Media
              </h2>
              <TextField
                label='Instagram'
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                fullWidth
                margin='normal'
                InputProps={{
                  startAdornment: <Typography mr={1}>@</Typography>,
                }}
                aria-label='Instagram username'
                placeholder='yourinstagramhandle'
              />
              <TextField
                label='Twitter'
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                fullWidth
                margin='normal'
                InputProps={{
                  startAdornment: <Typography mr={1}>@</Typography>,
                }}
                aria-label='Twitter username'
                placeholder='yourtwitterhandle'
              />
            </section>

            {/* Save Button */}
            <Button
              variant='contained'
              color='primary'
              onClick={handleSave}
              className={styles.saveButton}
              aria-label='Save all changes to profile'
            >
              Save Changes
            </Button>

            {/* Conversations Section */}
            <section
              className={styles.section}
              aria-labelledby='recent-chats-heading'
            >
              <h2 id='recent-chats-heading' className={styles.sectionTitle}>
                Recent Chats
              </h2>
              <List className={styles.conversationList}>
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <ListItem
                      key={conv._id}
                      className={styles.conversationItem}
                      component={Link}
                      href={`/chat/${conv.otherUser._id}`}
                      aria-label={`Chat with ${conv.otherUser.username}`}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={conv.otherUser.avatarUrl}
                          alt={`${conv.otherUser.username}'s avatar`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={conv.otherUser.username}
                        secondary={
                          <>
                            <Typography
                              component='span'
                              variant='body2'
                              color='text.primary'
                            >
                              {conv.message.message}
                            </Typography>
                            <Typography
                              variant='caption'
                              display='block'
                              color='text.secondary'
                            >
                              {moment(conv.message.createdAt).fromNow()}
                            </Typography>
                          </>
                        }
                      />
                      <IconButton
                        edge='end'
                        aria-label={`Go to chat with ${conv.otherUser.username}`}
                      >
                        <ChatIcon />
                      </IconButton>
                    </ListItem>
                  ))
                ) : (
                  <p className={styles.noConversations}>
                    No conversations yet. Start exploring to connect with
                    others!
                  </p>
                )}
              </List>
            </section>
          </main>
        ) : (
          <div className={styles.errorMessage} role='alert'>
            <Typography color='error'>
              Failed to load profile. Please try again later.
            </Typography>
          </div>
        )}

        {/* Notifications */}
        <Snackbar
          open={!!notifications.success}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={closeNotification}
            severity='success'
            sx={{ width: '100%' }}
            variant='filled'
          >
            {notifications.success}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!notifications.error}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={closeNotification}
            severity='error'
            sx={{ width: '100%' }}
            variant='filled'
          >
            {notifications.error}
          </Alert>
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
