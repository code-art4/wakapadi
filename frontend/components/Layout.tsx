// components/Layout.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Link,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import i18nextConfig from '../next-i18next.config';
import { useTranslation } from 'next-i18next';
import NotificationsDropdown from './NotificationsDropdown'; // 👈 Import the new dropdown
import styles from './Layout.module.css';

export default function Layout({
  children,
  title = 'Wakapadi – Free Walking Tours',
  description = 'Explore, connect, and discover local free walking tours and assistants around the world.',
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const currentLocale = router.locale || i18nextConfig.i18n.defaultLocale;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!localStorage.getItem('token'));
    if (userId) setCurrentUserId(userId);
  }, []);

  const handleLocaleChange = (e: any) => {
    const locale = e.target.value;
    router.push(router.pathname, router.asPath, { locale });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <div className={styles.layoutContainer}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>

      <AppBar position="sticky" className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Box className={styles.logoContainer}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              className={styles.menuButton}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>

            <NextLink href="/" passHref>
              <Typography variant="h6" className={styles.logoText}>
                Wakapadi
              </Typography>
            </NextLink>
          </Box>

          <Box className={styles.desktopNav}>
            <Link href="/whois" className={styles.navLink}>
              {t('whoisNearby')}
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/profile" className={styles.navLink}>Profile</Link>
                <NotificationsDropdown currentUserId={currentUserId} />
              </>
            )}
            {isLoggedIn ? (
              <Button onClick={handleLogout} color="inherit" className={styles.navLink}>Logout</Button>
            ) : null}
            <Select
              value={currentLocale}
              onChange={handleLocaleChange}
              className={styles.languageSelector}
              size="small"
            >
              {i18nextConfig.i18n.locales.map((loc) => (
                <MenuItem key={loc} value={loc}>{loc.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        classes={{ paper: styles.drawerPaper }}
      >
        <Box className={styles.drawerContainer}>
          <List className={styles.drawerList}>
            <ListItem button component={NextLink} href="/whois">
              <ListItemText primary={t('whoisNearby')} />
            </ListItem>
            {isLoggedIn && (
              <ListItem button component={NextLink} href="/profile">
                <ListItemText primary="Profile" />
              </ListItem>
            )}
            {isLoggedIn ? (
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            ) : (
              <ListItem button component={NextLink} href="/login">
                <ListItemText primary="Login" />
              </ListItem>
            )}

            <ListItem>
              <Select fullWidth value={currentLocale} onChange={handleLocaleChange} size="small">
                {i18nextConfig.i18n.locales.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <main className={styles.mainContent}>{children}</main>

      <Box component="footer" className={styles.footer}>
        <Container maxWidth="lg" className={styles.footerContent}>
          <Typography variant="body2" className={styles.copyright}>
            &copy; {new Date().getFullYear()} Wakapadi. All rights reserved.
          </Typography>
          <Box className={styles.footerLinks}>
            <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
            <Link href="/terms" className={styles.footerLink}>Terms</Link>
            <Link href="/cookies" className={styles.footerLink}>Cookies</Link>
          </Box>
        </Container>
      </Box>
    </div>
  );
}
