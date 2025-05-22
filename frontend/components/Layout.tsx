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
    const currentLocale = router.locale || 'en';
    const locales = i18nextConfig.i18n.locales;
    const [drawerOpen, setDrawerOpen] = useState(false);
  
    const languageLabels: Record<string, string> = {
      en: 'English',
      fr: 'Français',
      es: 'Español',
      de: 'Deutsch',
    };
  
    useEffect(() => {
      const savedLang = typeof window !== 'undefined' && localStorage.getItem('wakapadi-lang');
      if (savedLang && savedLang !== currentLocale) {
        router.push(router.pathname, router.asPath, { locale: savedLang });
      }
    }, []);
  
    const changeLanguage = (lang: string) => {
      localStorage.setItem('wakapadi-lang', lang);
      router.push(router.pathname, router.asPath, { locale: lang });
    };
  
    const navLinks = [
      { label: 'Assistants', href: '/assistants' },
      { label: '#Whois', href: '/whois' },
      { label: 'Privacy', href: '/privacy' },
    ];
  
    return (
      <>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://wakapadi.com${router.asPath}`} />
        </Head>
  
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <NextLink href="/" passHref legacyBehavior>
              <Link color="inherit" underline="none">
                <Typography variant="h6" fontWeight="bold">Wakapadi</Typography>
              </Link>
            </NextLink>
  
            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Button key={link.href} color="inherit" component={NextLink} href={link.href}>
                  {link.label}
                </Button>
              ))}
              <Select
                size="small"
                value={currentLocale}
                onChange={(e) => changeLanguage(e.target.value)}
                sx={{
                  ml: 2,
                  bgcolor: 'white',
                  color: 'black',
                  borderRadius: 1,
                  minWidth: 100,
                }}
              >
                {locales.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {languageLabels[lang] || lang.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </Box>
  
            {/* Mobile Menu */}
            <IconButton
              sx={{ display: { xs: 'block', md: 'none' } }}
              edge="end"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
  
        {/* Drawer for Mobile */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 250, p: 2 }}>
            <Typography variant="h6" gutterBottom>Menu</Typography>
            <List>
              {navLinks.map((link) => (
                <ListItem
                  button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItem>
              ))}
            </List>
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Language
              </Typography>
              <Select
                fullWidth
                size="small"
                value={currentLocale}
                onChange={(e) => {
                  changeLanguage(e.target.value);
                  setDrawerOpen(false);
                }}
              >
                {locales.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {languageLabels[lang] || lang.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Drawer>
  
        {/* Page Content */}
        <Container sx={{ py: 4 }}>{children}</Container>
  
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: 8,
            py: 3,
            backgroundColor: '#222',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Wakapadi. All rights reserved.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link href="/privacy" color="inherit" underline="hover" sx={{ mx: 1 }}>
              Privacy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" sx={{ mx: 1 }}>
              Terms
            </Link>
            <Link href="/cookies" color="inherit" underline="hover" sx={{ mx: 1 }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </>
    );
  }
  