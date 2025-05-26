import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Avatar, Box, Button, Chip, CircularProgress, Container,
  Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Popover, TextField, Typography, Snackbar, Alert
} from '@mui/material';
import { Picker } from 'emoji-mart';
// import 'emoji-mart/css/emoji-mart.css';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Layout from '../../components/Layout';
import io, { Socket } from 'socket.io-client';
import { api } from '../../lib/api';

interface Message {
  _id: string;
  text: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  read: boolean;
  avatar?: string;
  username?: string;
  fromSelf?: boolean;
}

interface GroupedMessages {
  [key: string]: Message[];
}

export default function ChatPage() {
  const router = useRouter();
  const { userId } = router.query;
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId || socketRef.current) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') || '' },
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('joinRoom', userId);
    });

    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', () => setConnectionError('Connection failed'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!userId || typeof userId !== 'string' || !socket) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/whois/chat/${userId}`);
        const msgs = res.data.messages.map((msg: any) => ({
          ...msg,
          text: msg.message,
          fromSelf: msg.fromUserId === currentUserId,
          username: msg.fromUserId === currentUserId ? 'You' : msg.fromUserId,
          avatar: `https://i.pravatar.cc/40?u=${msg.fromUserId}`
        }));
        setMessages(msgs);
      } catch {
        setConnectionError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    const onMessage = (msg: any) => {
      setMessages(prev => [...prev, {
        ...msg,
        text: msg.message,
        fromSelf: msg.fromUserId === currentUserId,
        username: msg.fromUserId === currentUserId ? 'You' : msg.fromUserId,
        avatar: `https://i.pravatar.cc/40?u=${msg.fromUserId}`,
        createdAt: msg.createdAt || new Date().toISOString()
      }]);
    };

    fetchMessages();
    socket.on('message:new', onMessage);
    return () => {
      socket.off('message:new', onMessage);
    };
  }, [userId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !socketRef.current || !userId) return;
    socketRef.current.emit('message', { to: userId, text });
    setText('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!typingTimeoutRef.current && socketRef.current && userId) {
      socketRef.current.emit('typing', { to: userId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleEmojiClick = (e: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(e.currentTarget);
  };

  const handleEmojiSelect = (emoji: any) => {
    setText(prev => prev + emoji.native);
    setEmojiAnchorEl(null);
  };

  const groupedMessages = messages.reduce((groups: GroupedMessages, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <Layout title="Chat - Wakapadi">
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" mb={2}>Chat</Typography>

        <Snackbar open={!!connectionError} autoHideDuration={6000} onClose={() => setConnectionError(null)}>
          <Alert severity="error" onClose={() => setConnectionError(null)}>{connectionError}</Alert>
        </Snackbar>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <Box key={date}>
                <Divider textAlign="center" sx={{ my: 2 }}>
                  <Chip label={date} />
                </Divider>
                {msgs.map((msg) => (
                  <ListItem
                    key={msg._id}
                    sx={{
                      justifyContent: msg.fromSelf ? 'flex-end' : 'flex-start',
                      textAlign: msg.fromSelf ? 'right' : 'left',
                      py: 1
                    }}
                  >
                    {!msg.fromSelf && <ListItemAvatar><Avatar src={msg.avatar} /></ListItemAvatar>}
                    <ListItemText
                      primary={msg.text}
                      secondary={<Typography variant="caption">{msg.username} • {new Date(msg.createdAt).toLocaleTimeString()}</Typography>}
                      sx={{
                        bgcolor: msg.fromSelf ? 'primary.light' : 'grey.200',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: '75%',
                      }}
                    />
                    {msg.fromSelf && <ListItemAvatar><Avatar src={msg.avatar} /></ListItemAvatar>}
                  </ListItem>
                ))}
              </Box>
            ))}
            <div ref={bottomRef} />

            <Box display="flex" gap={1} alignItems="center" mt={2}>
              <IconButton onClick={handleEmojiClick}><InsertEmoticonIcon /></IconButton>
              <Popover
                open={!!emojiAnchorEl}
                anchorEl={emojiAnchorEl}
                onClose={() => setEmojiAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <Picker onSelect={handleEmojiSelect} />
              </Popover>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={text}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                multiline
                maxRows={4}
                disabled={!socketConnected}
              />
              <Button variant="contained" onClick={handleSend} disabled={!text.trim() || !socketConnected}>Send</Button>
            </Box>
          </>
        )}
      </Container>
    </Layout>
  );
}
