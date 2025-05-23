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
    MenuItem
  } from '@mui/material';
  import MenuIcon from '@mui/icons-material/Menu';
  import { useRouter } from 'next/router';
  import Head from 'next/head';
  import NextLink from 'next/link';
  import { useEffect, useState } from 'react';
  import i18nextConfig from '../next-i18next.config';
  import { useTranslation } from 'next-i18next';
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
  
    const handleLocaleChange = (e: any) => {
      const locale = e.target.value;
      router.push(router.pathname, router.asPath, { locale });
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
      {/* Mobile Menu Button - Only shows on small screens */}
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

    {/* Desktop Navigation - Only shows on larger screens */}
    <Box className={styles.desktopNav}>
      <Link href="/assistants" className={styles.navLink}>
        {t('findAssistants')}
      </Link>
      <Link href="/whois" className={styles.navLink}>
        {t('whoisNearby')}
      </Link>
      <Select
        value={currentLocale}
        onChange={handleLocaleChange}
        className={styles.languageSelector}
        size="small"
      >
        {i18nextConfig.i18n.locales.map((loc) => (
          <MenuItem key={loc} value={loc} className={styles.languageOption}>
            {loc.toUpperCase()}
          </MenuItem>
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
              <ListItem 
                button 
                component={NextLink} 
                href="/assistants"
                className={styles.drawerListItem}
              >
                <ListItemText 
                  primary={t('findAssistants')} 
                  primaryTypographyProps={{ className: styles.drawerText }}
                />
              </ListItem>
              <ListItem 
                button 
                component={NextLink} 
                href="/whois"
                className={styles.drawerListItem}
              >
                <ListItemText 
                  primary={t('whoisNearby')} 
                  primaryTypographyProps={{ className: styles.drawerText }}
                />
              </ListItem>
              <ListItem className={styles.languageListItem}>
                <Select
                  fullWidth
                  value={currentLocale}
                  onChange={handleLocaleChange}
                  size="small"
                  className={styles.drawerLanguageSelector}
                >
                  {i18nextConfig.i18n.locales.map((loc) => (
                    <MenuItem 
                      key={loc} 
                      value={loc}
                      className={styles.drawerLanguageOption}
                    >
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
      <Link href="/privacy" className={styles.footerLink}>
        Privacy
      </Link>
      <Link href="/terms" className={styles.footerLink}>
        Terms
      </Link>
      <Link href="/cookies" className={styles.footerLink}>
        Cookies
      </Link>
    </Box>
  </Container>
</Box>
      </div>
    );
  }