import { Typography, List, ListItem } from '@mui/material';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion } from 'framer-motion';
import styles from '../styles/Privacy.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export default function PrivacyPolicy() {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('Privacy Policy')}>
      <Head>
        <meta name='robots' content='noindex, nofollow' />
      </Head>

      <div className={styles.container}>
        <motion.div variants={fadeInUp} custom={2}>
          <Typography className={styles.bodyText}>
            At Wakapadi, your privacy is a top priority. We collect only
            essential information to enhance your experience as you discover
            free walking tours, connect with fellow travelers, and plan shared
            adventures around the world.
          </Typography>
        </motion.div>

        <motion.div variants={fadeInUp} custom={3}>
          <Typography variant='h5' className={styles.sectionTitle}>
            GDPR Compliance
          </Typography>
          <Typography className={styles.bodyText}>
            In accordance with the General Data Protection Regulation (GDPR),
            you have full control over your personal information. If you wish to
            review, correct, or remove any data we hold, contact us at{' '}
            <span className={styles.contactEmail}>privacy@wakapadi.com</span>.
          </Typography>
        </motion.div>

        <motion.div variants={fadeInUp} custom={4}>
          <Typography variant='h5' className={styles.sectionTitle}>
            Your data rights
          </Typography>
          <List className={styles.list}>
            <ListItem className={styles.listItem}>
              • Request access to your personal data
            </ListItem>
            <ListItem className={styles.listItem}>
              • Request correction of inaccurate data
            </ListItem>
            <ListItem className={styles.listItem}>
              • Request deletion of your data
            </ListItem>
            <ListItem className={styles.listItem}>
              • Withdraw your consent at any time
            </ListItem>
          </List>
        </motion.div>
      </div>
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
