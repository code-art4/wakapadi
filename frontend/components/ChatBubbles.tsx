// components/ChatBubble.tsx
import { Avatar, Box, Typography, Tooltip } from '@mui/material';
import moment from 'moment-timezone';
import React from 'react';

interface Reaction {
  emoji: string;
  fromUserId: string;
}

interface ChatBubbleProps {
  message: string;
  fromSelf: boolean;
  avatar: string;
  username?: string;
  createdAt: string;
  reactions?: Reaction[];
  readStatus?: string | null;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  fromSelf,
  avatar,
  username,
  createdAt,
  reactions = [],
  readStatus,
}) => {
  const bubbleColor = fromSelf ? 'primary.main' : 'grey.100';
  const textColor = fromSelf ? 'white' : 'black';
  const borderRadius = 3;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: fromSelf ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1,
        mb: 1,
      }}
    >
      <Avatar src={avatar} alt={username} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: fromSelf ? 'flex-end' : 'flex-start',
          maxWidth: '70%',
        }}
      >
        <Box
          sx={{
            bgcolor: bubbleColor,
            color: textColor,
            px: 2,
            py: 1,
            borderRadius,
            borderTopRightRadius: fromSelf ? 0 : borderRadius,
            borderTopLeftRadius: fromSelf ? borderRadius : 0,
            boxShadow: 1,
            wordBreak: 'break-word',
          }}
        >
          <Typography variant="body2">{message}</Typography>
        </Box>

        {reactions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            {reactions.map((r, idx) => (
              <Typography key={idx} variant="caption">{r.emoji}</Typography>
            ))}
          </Box>
        )}

        <Tooltip title={moment(createdAt).format('LLLL')}>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {username && <strong>{username}</strong>} • {moment(createdAt).tz(moment.tz.guess()).format('h:mm A')}
            {fromSelf && readStatus && ` • ${readStatus}`}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatBubble;
