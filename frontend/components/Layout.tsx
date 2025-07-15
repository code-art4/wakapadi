import { Box, Button, Container } from '@mui/material';
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
        <h1 className={styles.header}>{title}</h1>

        {/* content */}
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
