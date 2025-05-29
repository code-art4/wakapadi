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

export default function CookiePolicy() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("cookiePolicy") + " | Wakapadi"}>
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
                {t("cookiePolicy")}
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={2}>
              <Typography variant="body1" paragraph>
                Wakapadi uses cookies to enhance your experience, store user preferences,
                improve functionality, and analyze traffic. By continuing to use the site,
                you agree to our use of cookies.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp} custom={3}>
              <Typography variant="h5" gutterBottom mt={4}>
                Types of Cookies We Use
              </Typography>
              <Box component="div" sx={{ pl: 2 }}>
                <List>
                  <ListItem>
                    <strong>Essential cookies:</strong> Necessary for the website to function properly
                  </ListItem>
                  <ListItem>
                    <strong>Analytics cookies:</strong> Help us understand how users interact with the site
                  </ListItem>
                  <ListItem>
                    <strong>Functional cookies:</strong> Enable enhanced features and personalization
                  </ListItem>
                </List>
              </Box>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4}>
              <Typography variant="body1" paragraph>
                You can control or delete cookies through your browser settings at any time.
                Disabling some cookies may affect the functionality of the Wakapadi platform.
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
