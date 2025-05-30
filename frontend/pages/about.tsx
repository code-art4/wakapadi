import { Typography, Container, Paper, Box } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import styles from '../styles/FooterPages.module.css';

export default function AboutPage() {
  const { t } = useTranslation("common");

  return (
    <Layout title="About | Wakapadi">
      <Head>
        <meta name="description" content="Learn about Wakapadi's mission to connect travelers worldwide" />
      </Head>

      <Container className={styles.container}>
        <Paper className={styles.contentPaper}>
          <Typography variant="h2" className={styles.pageTitle}>
            Our Story
          </Typography>
          
          <Typography className={styles.bodyText}>
            Wakapadi was born from a shared passion for authentic travel experiences. 
            Founded in 2023 by a team of globetrotters, we noticed how technology was 
            isolating travelers rather than connecting them.
          </Typography>
          
          <Typography variant="h3" className={styles.sectionTitle}>
            The Vision
          </Typography>
          
          <Typography className={styles.bodyText}>
            We believe travel should be about <strong>human connections</strong>, not just 
            checklists. Our platform bridges the gap between travelers and local communities, 
            creating meaningful interactions that enrich both sides.
          </Typography>
          
          <Box component="ul" className={styles.list}>
            <Typography component="li" className={styles.listItem}>
              Democratizing travel through free walking tours
            </Typography>
            <Typography component="li" className={styles.listItem}>
              Building trust through verified profiles
            </Typography>
            <Typography component="li" className={styles.listItem}>
              Promoting sustainable tourism practices
            </Typography>
          </Box>
          
          <Typography variant="h3" className={styles.sectionTitle}>
            Join Our Journey
          </Typography>
          
          <Typography className={styles.bodyText}>
            Whether you're a traveler seeking authentic experiences or a local wanting to 
            share your city's hidden gems, we'd love to have you onboard. Connect with us 
            at <span className={styles.contactEmail}>hello@wakapadi.com</span>.
          </Typography>
        </Paper>
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