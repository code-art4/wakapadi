// components/NotificationsDropdown.tsx
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
  } from '@mui/material';
  import ChatIcon from '@mui/icons-material/Chat';
  import { useState } from 'react';
  import moment from 'moment';
  import { useRouter } from 'next/router';
  import { useNotifications } from '../hooks/useNotifications';
  
  interface Props {
    currentUserId: string;
  }
  
  export default function NotificationsDropdown({ currentUserId }: Props) {
    const { notifications, clearNotificationsFromUser } = useNotifications(currentUserId);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();
  
    const totalUnread = notifications.reduce((sum, n) => sum + n.count, 0);
    const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
  
    const handleClickNotification = (userId: string) => {
      clearNotificationsFromUser(userId);
      router.push(`/chat/${userId}`);
      handleClose();
    };
  
    return (
      <>
        <IconButton onClick={handleOpen} color="inherit">
          <Badge badgeContent={totalUnread} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No new messages" />
            </MenuItem>
          ) : (
            notifications.map((notif) => (
              <MenuItem
                key={notif.fromUserId}
                onClick={() => handleClickNotification(notif.fromUserId)}
                sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}
              >
                <ListItemAvatar>
                  <Avatar src={`https://i.pravatar.cc/40?u=${notif.fromUserId}`} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${notif.fromUsername} (${notif.count})`}
                  secondary={
                    <>
                      <Typography variant="body2" noWrap>
                        {notif.messagePreview}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {moment(notif.createdAt).fromNow()}
                      </Typography>
                    </>
                  }
                />
              </MenuItem>
            ))
          )}
        </Menu>
      </>
    );
  }
  