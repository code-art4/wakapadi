import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Avatar, Box, Button, Chip, CircularProgress, Container,
  Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Popover, TextField, Typography, Snackbar, Alert, Menu, MenuItem
} from '@mui/material';
import { Picker } from 'emoji-mart';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MoreVertIcon from '@mui/icons-material/MoreVert'; 
import Layout from '../../components/Layout';
import io, { Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import moment from 'moment-timezone';

interface Reaction {
  emoji: string;
  fromUserId: string;
}

interface Message {
  _id: string;
  message: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  read: boolean;
  avatar?: string;
  username?: string;
  fromSelf?: boolean;
  reactions?: Reaction[];
  status?: 'sending' | 'sent' | 'failed';
  tempId?: string;
}

interface GroupedMessages {
  [key: string]: Message[];
}

const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export default function ChatPage() {
  const router = useRouter();
  const { userId: otherUserIdParam } = router.query;
  const otherUserId = typeof otherUserIdParam === 'string' && isValidObjectId(otherUserIdParam) 
    ? otherUserIdParam 
    : '';

  const currentUserId = typeof window !== 'undefined' 
    ? localStorage.getItem('userId') || '' 
    : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageOptionsAnchorEl, setMessageOptionsAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageDedupeMap = useRef<Set<string>>(new Set());

  // Debug logs
  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  // Main socket effect
  useEffect(() => {
    if (!router.isReady || !currentUserId) {
      if (router.isReady && !currentUserId) {
        setConnectionError("User not logged in. Please log in to chat.");
        setLoading(false);
      }
      return;
    }

    if (!otherUserId) {
      setConnectionError("Invalid chat partner ID. Please check the URL.");
      setLoading(false);
      return;
    }

    if (socketRef.current?.connected) {
      setLoading(false);
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') || '' },
      withCredentials: true
    });

    socketRef.current = socket;

    // Socket event handlers
    const onConnect = () => {
      setSocketConnected(true);
      setConnectionError(null);
      socket.emit('joinConversation', { userId1: currentUserId, userId2: otherUserId });
      fetchMessages();
    };

    const onDisconnect = (reason: string) => {
      setSocketConnected(false);
      setConnectionError(`Disconnected: ${reason}. Please refresh.`);
      setLoading(false);
    };

    const onConnectError = (error: Error) => {
      console.error("Connection error:", error);
      setConnectionError('Connection failed. Retrying...');
      setLoading(false);
    };

    const onTyping = ({ fromUserId }: { fromUserId: string }) => {
      if (fromUserId !== currentUserId && fromUserId === otherUserId) {
        setTypingUsers(prev => new Set(prev).add(fromUserId));
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(fromUserId);
            return newSet;
          });
        }, 2000);
      }
    };

    const onReadConfirm = ({ messageIds }: { messageIds: string[] }) => {
      setMessages(prev => prev.map(msg =>
        messageIds.includes(msg._id) && msg.fromSelf 
          ? { ...msg, read: true, status: 'sent' } 
          : msg
      ));
    };

    const onReaction = ({ messageId, reaction }: { messageId: string, reaction: Reaction }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId
          ? {
              ...msg,
              reactions: msg.reactions
                ? [...msg.reactions.filter(r => r.fromUserId !== reaction.fromUserId), reaction]
                : [reaction]
            }
          : msg
      ));
    };

    const onNewMessage = (msg: any) => {
      // Deduplication check
      if (messageDedupeMap.current.has(msg._id) || (msg.tempId && messageDedupeMap.current.has(msg.tempId))) {
        console.log('Duplicate message detected, ignoring');
        return;
      }

      messageDedupeMap.current.add(msg._id);
      if (msg.tempId) messageDedupeMap.current.add(msg.tempId);

      setMessages(prev => {
        const existingIndex = prev.findIndex(m => 
          m._id === msg._id || (msg.tempId && m.tempId === msg.tempId)
        );

        if (existingIndex > -1) {
          // Update existing message
          const updated = [...prev];
          updated[existingIndex] = {
            _id: msg._id,
            message: msg.message,
            fromUserId: msg.fromUserId,
            toUserId: msg.toUserId,
            createdAt: msg.createdAt,
            read: msg.read,
            fromSelf: msg.fromUserId === currentUserId,
            username: msg.username,
            avatar: msg.avatar || `https://i.pravatar.cc/40?u=${msg.fromUserId}`,
            reactions: msg.reactions || [],
            status: 'sent',
          };
          return updated;
        } else {
          // Add new message
          const newMessage: Message = {
            _id: msg._id,
            message: msg.message,
            fromUserId: msg.fromUserId,
            toUserId: msg.toUserId,
            createdAt: msg.createdAt || new Date().toISOString(),
            read: msg.read,
            fromSelf: msg.fromUserId === currentUserId,
            username: msg.username,
            avatar: msg.avatar || `https://i.pravatar.cc/40?u=${msg.fromUserId}`,
            reactions: msg.reactions || [],
            status: 'sent',
          };

          if (newMessage.fromUserId === otherUserId && !newMessage.read) {
            socket.emit('message:read', {
              toUserId: currentUserId,
              fromUserId: otherUserId,
              messageIds: [newMessage._id],
            });
            return [...prev, { ...newMessage, read: true }];
          }
          return [...prev, newMessage];
        }
      });

      if (msg.fromUserId === currentUserId) {
        setText('');
      }
    };

    // Setup event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('typing', onTyping);
    socket.on('message:read:confirm', onReadConfirm);
    socket.on('message:reaction', onReaction);
    socket.on('message:new', onNewMessage);

    // Fetch messages function
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/whois/chat/${otherUserId}`);
        const msgs = res.data.messages.map((msg: any) => ({
          _id: msg._id,
          message: msg.message,
          fromUserId: msg.fromUserId,
          toUserId: msg.toUserId,
          createdAt: msg.createdAt,
          read: msg.read,
          fromSelf: msg.fromUserId === currentUserId,
          username: msg.username,
          avatar: msg.avatar || `https://i.pravatar.cc/40?u=${msg.fromUserId}`,
          reactions: msg.reactions || [],
          status: 'sent',
        }));
        
        // Add to dedupe map
        msgs.forEach((msg: Message) => messageDedupeMap.current.add(msg._id));
        
        setMessages(msgs);

        const unreadMessageIds = msgs
          .filter((msg: Message) => !msg.read && msg.fromUserId === otherUserId)
          .map((msg: Message) => msg._id);

        if (unreadMessageIds.length > 0) {
          socket.emit('message:read', {
            toUserId: currentUserId,
            fromUserId: otherUserId,
            messageIds: unreadMessageIds,
          });
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        setConnectionError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };

    return () => {
      if (socketRef.current) {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        socket.off('typing', onTyping);
        socket.off('message:read:confirm', onReadConfirm);
        socket.off('message:reaction', onReaction);
        socket.off('message:new', onNewMessage);
        socket.disconnect();
        socketRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      messageDedupeMap.current.clear();
    };
  }, [router.isReady, otherUserId, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers.size]);

  // Handlers
  const handleSend = useCallback(async () => {
    if (!text.trim() || !socketRef.current || !otherUserId) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // const messageToSend: Message = {
    //   _id: tempId,
    //   message: text,
    //   fromUserId: currentUserId,
    //   toUserId: otherUserId,
    //   createdAt: new Date().toISOString(),
    //   read: false,
    //   fromSelf: true,
    //   username: 'You',
    //   avatar: `https://i.pravatar.cc/40?u=${currentUserId}`,
    //   status: 'sending',
    //   tempId,
    // };

    // setMessages(prev => [...prev, messageToSend]);
    messageDedupeMap.current.add(tempId);

    socketRef.current.emit('message', { 
      to: otherUserId, 
      message: text, 
      tempId 
    });

    // Clear typing status
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentUserId);
      return newSet;
    });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [text, currentUserId, otherUserId]);

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!socketRef.current || !otherUserId) return;

    socketRef.current.emit('typing', { to: otherUserId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stoppedTyping', { to: otherUserId });
      typingTimeoutRef.current = null;
    }, 2000);
  }, [otherUserId]);

  const handleEmojiClick = (e: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(e.currentTarget);
  };

  const handleEmojiSelect = (emoji: any) => {
    setText(prev => prev + emoji.native);
    setEmojiAnchorEl(null);
  };

  const handleMessageOptionsClick = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setMessageOptionsAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMessageOptionsClose = () => {
    setMessageOptionsAnchorEl(null);
    setSelectedMessageId(null);
  };

  const handleReaction = useCallback((emoji: string) => {
    if (selectedMessageId && socketRef.current && otherUserId) {
      socketRef.current.emit('message:reaction', {
        messageId: selectedMessageId,
        emoji,
        toUserId: otherUserId,
      });
      handleMessageOptionsClose();
    }
  }, [selectedMessageId, otherUserId]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups: GroupedMessages, msg) => {
    const date = moment(msg.createdAt).format('LL');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const getReadStatusText = (message: Message) => {
    if (message.fromSelf) {
      if (message.status === 'sending') return 'Sending...';
      if (message.status === 'failed') return 'Failed!';
      if (message.read) return 'Read';
      return 'Sent';
    }
    return null;
  };

  // Render loading/error states
  if (!router.isReady) {
    return (
      <Layout title="Chat">
        <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" mt={2}>Loading chat...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!otherUserId || !currentUserId) {
    return (
      <Layout title="Chat">
        <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: 'center', alignItems: 'center' }}>
          <Alert severity="error">{connectionError || "Chat cannot be loaded. Invalid user IDs."}</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Chat">
      <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <Typography variant="h5" mb={2}>Chatting with {otherUserId}</Typography>

        <Snackbar open={!!connectionError} autoHideDuration={6000} onClose={() => setConnectionError(null)}>
          <Alert severity="error" onClose={() => setConnectionError(null)}>{connectionError}</Alert>
        </Snackbar>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : (
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, border: '1px solid #eee', borderRadius: 2 }}>
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
                      py: 0.5,
                      alignItems: 'flex-start',
                    }}
                  >
                    {!msg.fromSelf && <ListItemAvatar><Avatar src={msg.avatar} /></ListItemAvatar>}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.fromSelf ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                      }}
                    >
                      <ListItemText
                        primary={msg.message}
                        sx={{
                          bgcolor: msg.fromSelf ? 'primary.light' : 'grey.200',
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          wordBreak: 'break-word',
                        }}
                      />
                      {msg.reactions?.length > 0 && (
                        <Box sx={{
                          display: 'flex',
                          gap: 0.5,
                          mt: 0.5,
                          p: 0.5,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          borderRadius: 1
                        }}>
                          {msg.reactions.map((r, idx) => (
                            <Typography key={idx} variant="caption" sx={{ lineHeight: 1 }}>
                              {r.emoji}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {msg.username} • {moment(msg.createdAt).tz(moment.tz.guess()).format('h:mm A')}
                        {msg.fromSelf && (
                          <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
                            {getReadStatusText(msg)}
                          </Box>
                        )}
                      </Typography>
                    </Box>
                    {msg.fromSelf && <ListItemAvatar><Avatar src={msg.avatar} /></ListItemAvatar>}
                    <IconButton
                      size="small"
                      sx={{ alignSelf: 'flex-start', mt: 1, ml: 1, mr: 1 }}
                      onClick={(e) => handleMessageOptionsClick(e, msg._id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </Box>
            ))}
            {typingUsers.size > 0 && (
              <Box sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                <Typography variant="caption">
                  {Array.from(typingUsers).map(id => `User ${id}`).join(', ')} is typing...
                </Typography>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>
        )}

        <Menu
          anchorEl={messageOptionsAnchorEl}
          open={Boolean(messageOptionsAnchorEl)}
          onClose={handleMessageOptionsClose}
        >
          <MenuItem onClick={() => handleReaction('👍')}>👍 Like</MenuItem>
          <MenuItem onClick={() => handleReaction('❤️')}>❤️ Love</MenuItem>
          <MenuItem onClick={() => handleReaction('😂')}>😂 Laugh</MenuItem>
          <MenuItem onClick={() => handleReaction('😮')}>😮 Wow</MenuItem>
          <MenuItem onClick={() => handleReaction('😢')}>😢 Sad</MenuItem>
          <MenuItem onClick={() => handleReaction('😡')}>😡 Angry</MenuItem>
        </Menu>

        <Box display="flex" gap={1} alignItems="center" mt={2} p={1} bgcolor="background.paper" borderRadius={1}>
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
            disabled={!socketConnected || loading || !otherUserId}
            variant="outlined"
            size="small"
          />
          <Button 
            variant="contained" 
            onClick={handleSend} 
            disabled={!text.trim() || !socketConnected || loading || !otherUserId}
          >
            Send
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}