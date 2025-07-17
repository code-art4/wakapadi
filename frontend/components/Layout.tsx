import { Box, Button, Container, Typography } from '@mui/material';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { LayoutProps } from './../types/components/layout';
import styles from '../styles/components/layout.module.css';

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
      </Head>

      <main className={styles.main}>
        <Container className={styles.container}>
          <Header homepage={false} />
        </Container>

        {/* header */}
        <Typography variant='h1' className={styles.header}>
          {title}
        </Typography>

        {/* content */}
        <Box component='section' sx={{ p: 2 }} className={styles.main}>
          <Container className={styles.container}>{children}</Container>
        </Box>

        <Box className={styles.explore}>
          <Typography variant='h2'>Ready to Explore?</Typography>
          <Typography variant='body1'>
            Join thousands of travelers who have discovered authentic local
            experiences through Wakapadi.
          </Typography>
          <Button>Start your adventure</Button>
        </Box>

        <Footer />
      </main>
    </>
  );
}
