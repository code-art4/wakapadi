// pages/chat/[userId].tsx
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Avatar, Box, Button, Chip, CircularProgress, Container,
  Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Popover, TextField, Typography
} from '@mui/material';
import { Picker } from 'emoji-mart';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import io from 'socket.io-client';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
  query: { token: typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '' },
  autoConnect: true,
});

function groupByDate(messages: any[]) {
  const grouped: Record<string, any[]> = {};
  for (const msg of messages) {
    const dateStr = new Date(msg.createdAt).toLocaleDateString();
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(msg);
  }
  return grouped;
}

export default function ChatPage() {
  const router = useRouter();
  const { userId } = router.query;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState<{ el: HTMLElement; index: number } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!userId || typeof userId !== 'string') return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/whois/chat/${userId}`);
        setMessages(res.data);
        setLoading(false);
        await api.post(`/whois/chat/${userId}/read`);
        socket.emit('message:read', { fromUserId: userId, toUserId: 'me' }); // replace 'me' with actual ID if tracked
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    fetchMessages();

    socket.emit('joinRoom', userId);

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing', () => {
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('userOnline', (uid: string) => {
      setOnlineUsers((prev) => [...new Set([...prev, uid])]);
    });

    socket.on('userOffline', (uid: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== uid));
    });

    socket.on('message:read:confirm', ({ readerId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.fromSelf ? { ...msg, read: true } : msg
        )
      );
    });

    return () => {
      socket.emit('leaveRoom', userId);
      socket.off('message');
      socket.off('typing');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('message:read:confirm');
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;

    const newMsg = {
      text,
      fromSelf: true,
      createdAt: new Date().toISOString(),
      read: false,
      username: 'You',
      avatar: 'https://i.pravatar.cc/40?img=1',
      userId: 'me',
    };

    socket.emit('message', { to: userId, text });
    setMessages((prev) => [...prev, newMsg]);
    setText('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    socket.emit('typing', { to: userId });
  };

  const handleEmojiClick = (e: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(e.currentTarget);
  };

  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
    setEmojiAnchorEl(null);
  };

  const handleReactionClick = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    setReactionAnchorEl({ el: e.currentTarget, index });
  };

  const handleReactionSelect = (emoji: any) => {
    if (reactionAnchorEl) {
      const updated = [...messages];
      updated[reactionAnchorEl.index].reaction = emoji.native;
      setMessages(updated);
    }
    setReactionAnchorEl(null);
  };

  const grouped = groupByDate(messages);

  return (
    <Layout title="Chat - Wakapadi">
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" mb={2}>Chat</Typography>

        {loading ? <CircularProgress /> : (
          <Box>
            <List sx={{ maxHeight: 500, overflowY: 'auto', mb: 2 }}>
              {Object.entries(grouped).map(([date, msgs]) => (
                <Box key={date}>
                  <Divider textAlign="center" sx={{ my: 2 }}>
                    <Chip label={date} />
                  </Divider>
                  {msgs.map((msg, index) => (
                    <ListItem key={index} sx={{ justifyContent: msg.fromSelf ? 'flex-end' : 'flex-start' }}>
                      {!msg.fromSelf && (
                        <ListItemAvatar>
                          <Box position="relative">
                            <Avatar src={msg.avatar} />
                            {onlineUsers.includes(msg.userId) && (
                              <Box
                                position="absolute"
                                bottom={0}
                                right={0}
                                width={10}
                                height={10}
                                bgcolor="green"
                                borderRadius="50%"
                                border="2px solid white"
                              />
                            )}
                          </Box>
                        </ListItemAvatar>
                      )}

                      <ListItemText
                        primary={
                          <>
                            {msg.text}
                            {msg.reaction && <span style={{ marginLeft: 6 }}>{msg.reaction}</span>}
                          </>
                        }
                        secondary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption">{msg.username}</Typography>
                            <Typography variant="caption">{new Date(msg.createdAt).toLocaleTimeString()}</Typography>
                            {msg.fromSelf && (
                              <Chip
                                label={msg.read ? 'Read' : 'Sent'}
                                size="small"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                            <IconButton onClick={(e) => handleReactionClick(e, index)} size="small">
                              <EmojiEmotionsIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                        sx={{
                          bgcolor: msg.fromSelf ? '#e0f7fa' : '#f1f1f1',
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
            </List>

            {isTyping && <Typography variant="body2" color="text.secondary" mb={1}>Typing...</Typography>}

            <Box display="flex" gap={1} alignItems="center">
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
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button variant="contained" onClick={handleSend}>Send</Button>
            </Box>

            <Popover
              open={!!reactionAnchorEl}
              anchorEl={reactionAnchorEl?.el || null}
              onClose={() => setReactionAnchorEl(null)}
            >
              <Box p={1} display="flex" gap={1}>
                {['👍', '❤️', '😂', '🎉', '😢', '👏'].map((emoji) => (
                  <IconButton key={emoji} onClick={() => handleReactionSelect({ native: emoji })}>
                    <Typography fontSize="1.5rem">{emoji}</Typography>
                  </IconButton>
                ))}
              </Box>
            </Popover>
          </Box>
        )}
      </Container>
    </Layout>
  );
}
