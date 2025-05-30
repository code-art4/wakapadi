import { Avatar, Box, Typography, Tooltip } from '@mui/material';
import moment from 'moment-timezone';
import React from 'react';
import styles from '../styles/chat.module.css';

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
  return (
    <Box className={`${styles.bubbleContainer} ${
      fromSelf ? styles.bubbleContainerSelf : styles.bubbleContainerOther
    }`}>
      {!fromSelf && (
        <Avatar src={avatar} alt={username} className={styles.bubbleAvatar} />
      )}
      
      <Box className={styles.bubbleContent}>
        <Box className={`${styles.messageBubble} ${
          fromSelf ? styles.messageBubbleSelf : styles.messageBubbleOther
        }`}>
          <Typography variant="body2" className={styles.messageText}>
            {message}
          </Typography>
        </Box>
        
        {reactions.length > 0 && (
          <Box className={styles.reactionsContainer}>
            {reactions.map((r, idx) => (
              <Typography key={idx} variant="caption" className={styles.reaction}>
                {r.emoji}
              </Typography>
            ))}
          </Box>
        )}
        
        <Tooltip title={moment(createdAt).format('LLLL')}>
          <Typography variant="caption" className={styles.messageMeta}>
            {!fromSelf && username && (
              <span className={styles.username}>{username}</span>
            )}
            <span className={styles.timestamp}>
              {moment(createdAt).tz(moment.tz.guess()).format('h:mm A')}
            </span>
            {fromSelf && readStatus && (
              <span className={styles.readStatus}>{readStatus}</span>
            )}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatBubble;