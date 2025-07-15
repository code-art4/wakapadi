import { Typography, Container, Paper, Box, Button } from '@mui/material';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/about.module.css';
import Header from './../components/Header';
import Image from 'next/image';
import Footer from './../components/Footer';
import { useRouter } from 'next/router';

const languages = [
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'fr', name: 'Français', flag: 'FR' },
];

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
  // const { t } = useTranslation('common');
  // const currentLocale = router.locale || i18nextConfig.i18n.defaultLocale;
  // const [drawerOpen, setDrawerOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [currentUserId, setCurrentUserId] = useState('');
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // useEffect(() => {
  //   const userId = localStorage.getItem('userId');
  //   setIsLoggedIn(!!localStorage.getItem('token'));
  //   if (userId) setCurrentUserId(userId);
  // }, []);

  // const handleLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleLanguageClose = () => {
  //   setAnchorEl(null);
  // };

  // const changeLanguage = (locale: string) => {
  //   handleLanguageClose();
  //   router.push(router.pathname, router.asPath, { locale });
  // };

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('userId');
  //   setIsLoggedIn(false);
  //   router.push('/');
  // };

  // const currentLanguage =
  //   languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        <link rel='icon' type='image/png' href='/favicon.png' />
      </Head>

      <main className={styles.main}>
        <Container className={styles.container}>
          <Header homepage={false} />
        </Container>

        <h1 className={styles.header}>{title}</h1>
        <main className={styles.main}>
          <Container className={styles.container}>{children}</Container>
        </main>

        <Box className={styles.explore}>
          <h3>Ready to Explore?</h3>
          <p>
            Join thousands of travelers who have discovered authentic local
            experiences through Wakapadi.
          </p>
          <Button>Start your adventure</Button>
        </Box>

        <Footer />
      </main>
    </>
  );
}
