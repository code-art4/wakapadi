import { Typography, Container, Paper } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5
    }
  })
};

export default function TermsOfUse() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("termsOfUse") + " | Wakapadi"}>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 6 }}>
            <motion.div variants={fadeInUp} custom={1}>
              <Typography variant="h3" gutterBottom textAlign="center">
                {t("termsOfUse")}
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={2}>
              <Typography variant="body1" paragraph>
                Welcome to Wakapadi — a platform that enables travelers and explorers to discover local experiences, join free walking tours, and connect with fellow adventurers in a secure, open environment.
              </Typography>
              <Typography variant="body1" paragraph>
                By accessing or using Wakapadi, you agree to abide by our community guidelines and platform terms. These terms may be updated as our features and community evolve.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={3}>
              <Typography variant="h5" gutterBottom mt={4}>
                Acceptable Use Policy
              </Typography>
              <Typography variant="body1" paragraph>
                Wakapadi promotes a culture of respect, inclusiveness, and exploration. As a user, you must not:
              </Typography>
              <ul>
                <li>Harass or harm other users</li>
                <li>Spam, mislead, or impersonate others</li>
                <li>Disrupt tours or public meet-ups in any way</li>
                <li>Use the platform for commercial solicitation without permission</li>
              </ul>
              <Typography variant="body1" paragraph>
                Violating any of these rules may result in account suspension or a permanent ban.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4}>
              <Typography variant="h5" gutterBottom mt={4}>
                Updates and Modifications
              </Typography>
              <Typography variant="body1" paragraph>
                Wakapadi may revise these Terms of Use periodically. We will notify users of major updates, but we recommend checking this page regularly to stay informed.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={5}>
              <Typography variant="body1" paragraph>
                Thank you for being part of the Wakapadi community. Let's explore the world — together.
              </Typography>
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
