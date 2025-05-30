import { Typography, Container, Paper, List, ListItem } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { motion } from "framer-motion";
import styles from '../styles/FooterPages.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 }
  })
};

export default function CookiePolicy() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("cookiePolicy") + " | Wakapadi"}>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Container className={styles.container}>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Paper className={styles.contentPaper}>
            <motion.div variants={fadeInUp} custom={1}>
              <Typography variant="h3" className={styles.pageTitle}>
                {t("cookiePolicy")}
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={2}>
              <Typography className={styles.bodyText}>
                Wakapadi uses cookies to enhance your experience, store user preferences,
                improve functionality, and analyze traffic.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={3}>
              <Typography variant="h5" className={styles.sectionTitle}>
                Types of Cookies We Use
              </Typography>
              <List className={styles.list}>
                <ListItem className={styles.listItem}>
                  <strong>Essential cookies:</strong> Necessary for the website to function
                </ListItem>
                <ListItem className={styles.listItem}>
                  <strong>Analytics cookies:</strong> Help us understand user interactions
                </ListItem>
                <ListItem className={styles.listItem}>
                  <strong>Functional cookies:</strong> Enable enhanced features
                </ListItem>
              </List>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"]))
    }
  };
}