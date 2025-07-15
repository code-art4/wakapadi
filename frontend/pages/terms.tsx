import { Typography, Container, Paper, List, ListItem } from '@mui/material';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion } from 'framer-motion';
import styles from '../styles/terms.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export default function TermsOfUse() {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('termsOfUse')}>
      <Head>
        <meta name='robots' content='noindex, nofollow' />
      </Head>

      <Container className={styles.container}>
        <motion.div initial='hidden' animate='visible' variants={fadeInUp}>
          <motion.div variants={fadeInUp} custom={2}>
            <Typography className={styles.bodyText}>
              Welcome to Wakapadi — a platform that enables travelers and
              explorers to discover local experiences, join free walking tours,
              and connect with fellow adventurers in a secure, open environment.
            </Typography>
            <Typography className={styles.bodyText}>
              By accessing or using Wakapadi, you agree to abide by our
              community guidelines and platform terms. These terms may be
              updated as our features and community evolve.
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp} custom={3}>
            <Typography variant='h5' className={styles.sectionTitle}>
              Acceptable Use Policy
            </Typography>
            <Typography className={styles.bodyText}>
              Wakapadi promotes a culture of respect, inclusiveness, and
              exploration. As a user, you must not:
            </Typography>
            <List className={styles.list}>
              <ListItem className={styles.listItem}>
                • Harass or harm other users
              </ListItem>
              <ListItem className={styles.listItem}>
                • Spam, mislead, or impersonate others
              </ListItem>
              <ListItem className={styles.listItem}>
                • Disrupt tours or public meet-ups
              </ListItem>
              <ListItem className={styles.listItem}>
                • Use the platform for commercial solicitation without
                permission
              </ListItem>
            </List>
            <Typography className={styles.bodyText}>
              Violating any of these rules may result in account suspension or a
              permanent ban.
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp} custom={4}>
            <Typography variant='h5' className={styles.sectionTitle}>
              Updates and Modifications
            </Typography>
            <Typography className={styles.bodyText}>
              Wakapadi may revise these Terms of Use periodically. We will
              notify users of major updates, but we recommend checking this page
              regularly to stay informed.
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
