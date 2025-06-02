import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Popover,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import io, { Socket } from 'socket.io-client';
import styles from '../styles/bot.module.css';

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

interface ChatMessage {
  text: string;
  fromSelf: boolean;
  timestamp?: Date;
  followUp?: boolean;
}

interface BotResponse {
  text: string;
  results?: any[];
  followUp?: boolean;
}

const ChatBubble = ({ message, fromSelf, avatar, createdAt }) => {
  return (
    <div className={`${styles.messageItem} ${fromSelf ? styles.messageItemSelf : styles.messageItemOther}`}>
      {!fromSelf && avatar && (
        <img src={avatar} className={styles.avatar} alt="Bot avatar" />
      )}
      <div className={`${styles.messageBubble} ${fromSelf ? styles.messageBubbleSelf : styles.messageBubbleOther}`}>
        <div className={styles.messageText}>{message}</div>
        <div className={styles.messageMeta}>
          <span className={styles.messageTime}>
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ChatBotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') || '' },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const onConnect = () => {
      setSocketConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
    };

    const onConnectError = (err: Error) => {
      console.error('Connection error:', err);
      setError('Failed to connect to the bot service. Trying to reconnect...');
    };

    const onBotResponse = (response: string | BotResponse) => {
      let messageText: string;
      let followUp = false;
      
      if (typeof response === 'string') {
        messageText = response;
      } else {
        messageText = response.text;
        followUp = response.followUp || false;
      }

      setMessages((prev) => [...prev, { 
        text: messageText, 
        fromSelf: false,
        timestamp: new Date(),
        followUp 
      }]);
      setLoading(false);
      setIsBotTyping(false);

      if (followUp) {
        setSuggestedFollowUps([
          "Show more options",
          "Find cheaper alternatives",
          "What's the most popular?"
        ]);
      }
    };

    const onBotTyping = (typing: boolean) => {
      setIsBotTyping(typing);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('bot:response', onBotResponse);
    socket.on('bot:typing', onBotTyping);
    socket.onAny((event, ...args) => {
      console.log('Socket event:', event, args);
    });

    // Initial bot greeting
    setMessages([{
      text: "🤖 Hello! I'm your tour assistant. Ask me about tours in any city!",
      fromSelf: false,
      timestamp: new Date()
    }]);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('bot:response', onBotResponse);
      socket.off('bot:typing', onBotTyping);
      socket.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const verifyConnection = useCallback(() => {
    if (!socketRef.current) return false;
    
    try {
      socketRef.current.emit('ping', (response: string) => {
        if (response !== 'pong') {
          setError('Connection verification failed');
          return false;
        }
        return true;
      });
    } catch (err) {
      setError('Connection check error');
      return false;
    }
  }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (socketConnected && !verifyConnection()) {
//         setSocketConnected(false);
//         setError('Connection lost. Reconnecting...');
//       }
//     }, 10000);
    
//     return () => clearInterval(interval);
//   }, [socketConnected, verifyConnection]);

  const handleSend = useCallback(() => {
    if (!text.trim() || !socketRef.current) return;
    
    const newMessage: ChatMessage = { 
      text, 
      fromSelf: true,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);
    setText('');
    setSuggestedFollowUps([]);
    console.log("msg", text)
    socketRef.current.emit('bot:message', { 
      message: text,
      context: {
        lastMessages: messages.slice(-3).map(m => m.text)
      }
     
    }, (err: Error) => {
      if (err) {
        // console.log("err", err)
        setError('Failed to send message');
        setLoading(false);
        // setMessages(prev => [...prev, {
        //   text: "⚠️ Couldn't reach the bot. Please try again.",
        //   fromSelf: false,
        //   timestamp: new Date()
        // }]);
      }
    });
  }, [text, messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleEmojiClick = (e: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(e.currentTarget);
  };

  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
    setEmojiAnchorEl(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout title="Tour Assistant Bot">
      <Container className={styles.chatContainer}>
        <Box className={styles.chatHeader}>
          <Typography variant="h6" className={styles.chatTitle}>
            Chat with Tour Assistant
          </Typography>
          <Box display="flex" alignItems="center">
            <Box 
              width={10} 
              height={10} 
              bgcolor={socketConnected ? 'success.main' : 'error.main'} 
              borderRadius="50%" 
              mr={1}
            />
            <Typography variant="body2" className={styles.chatSubtitle}>
              {socketConnected ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box className={styles.messagesContainer}>
          {messages.map((msg, i) => (
            <Box key={i} className={styles.messageItem}>
              <ChatBubble
                message={msg.text}
                fromSelf={msg.fromSelf}
                avatar={msg.fromSelf ? '' : '/bot_avatar.png'}
                createdAt={msg.timestamp?.toISOString()}
              />
            </Box>
          ))}
          
          {loading && (
            <Box className={styles.messageItem}>
              <ChatBubble
                message={<CircularProgress size={20} />}
                fromSelf={false}
                avatar="/bot_avatar.png"
                createdAt={new Date().toISOString()}
              />
            </Box>
          )}

          {isBotTyping && (
            <Box className={styles.messageItem}>
              <ChatBubble
                message="Typing..."
                fromSelf={false}
                avatar="/bot_avatar.png"
              />
            </Box>
          )}
          
          <div ref={bottomRef} />
        </Box>

        {suggestedFollowUps.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, p: 1, flexWrap: 'wrap' }}>
            {suggestedFollowUps.map((suggestion, i) => (
              <Button
                key={i}
                variant="outlined"
                size="small"
                onClick={() => {
                  setText(suggestion);
                  handleSend();
                }}
              >
                {suggestion}
              </Button>
            ))}
          </Box>
        )}

        <Box className={styles.inputContainer}>
          <IconButton onClick={handleEmojiClick} disabled={!socketConnected}>
            <InsertEmoticonIcon />
          </IconButton>
          
          <Popover
            open={!!emojiAnchorEl}
            anchorEl={emojiAnchorEl}
            onClose={() => setEmojiAnchorEl(null)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Picker 
              onEmojiSelect={handleEmojiSelect} 
              theme="light"
              previewPosition="none"
            />
          </Popover>
          
          <TextField
            fullWidth
            placeholder={socketConnected ? "Ask me about tours..." : "Connecting..."}
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            disabled={!socketConnected || loading}
            multiline
            maxRows={4}
          />
          
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!text.trim() || !socketConnected || loading}
            className={styles.sendButton}
          >
            Send
          </Button>
        </Box>

        <Button 
          onClick={() => verifyConnection()} 
          variant="outlined"
          sx={{ mt: 2, alignSelf: 'center' }}
        >
          Test Connection
        </Button>
      </Container>
    </Layout>
  );
}