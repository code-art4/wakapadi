import { Typography, Box, List, ListItem, Container, Paper } from "@mui/material";
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

export default function PrivacyPolicy() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("privacyPolicy") + " | Wakapadi"}>
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
                {t("privacyPolicy")}
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={2}>
              <Typography variant="body1" paragraph>
                At Wakapadi, your privacy is a top priority. We collect only essential
                information to enhance your experience as you discover free walking tours,
                connect with fellow travelers, and plan shared adventures around the world.
                Your data is never sold, and we only share it when legally required.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={3}>
              <Typography variant="h5" gutterBottom mt={4}>
                GDPR Compliance
              </Typography>
              <Typography variant="body1" paragraph>
                In accordance with the General Data Protection Regulation (GDPR), you have
                full control over your personal information. If you wish to review,
                correct, or remove any data we hold, feel free to reach out to us at
                <strong> privacy@wakapadi.com</strong>.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4}>
              <Typography variant="h5" gutterBottom mt={4}>
                Your Data Rights
              </Typography>
              <Box component="div" sx={{ pl: 2 }}>
                <Typography variant="body1" paragraph>
                  As a Wakapadi user, you can:
                </Typography>
                <List>
                  <ListItem>- Request access to your personal data</ListItem>
                  <ListItem>- Request correction of inaccurate data</ListItem>
                  <ListItem>- Request deletion of your data</ListItem>
                  <ListItem>- Withdraw your consent at any time</ListItem>
                  <ListItem>- Lodge a complaint with a supervisory authority</ListItem>
                </List>
              </Box>
            </motion.div>

            <motion.div variants={fadeInUp} custom={5}>
              <Typography variant="h5" gutterBottom mt={4}>
                How We Use Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                Wakapadi uses your information to personalize recommendations, support
                secure interactions between travelers, and continuously improve the
                platform. Your location, preferences, and connections help us serve you
                better, especially as we expand features like real-time traveler visibility
                and meet-up coordination.
              </Typography>

              <Typography variant="body1" paragraph>
                By using Wakapadi, you agree to the data practices outlined in this policy.
                We encourage you to revisit this page occasionally to stay informed about
                updates.
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
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
