import { Typography } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function CookiePolicy() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("cookiePolicy")}>
      <Typography variant="h4" gutterBottom>
        {t("cookiePolicy")}
      </Typography>
      <Typography paragraph>
        Wakapadi uses cookies to store user preferences, improve functionality,
        and analyze website traffic. By using our site, you consent to our use of cookies.
      </Typography>
      <Typography variant="h6" gutterBottom>Types of Cookies Used</Typography>
      <Typography paragraph>
        <ul>
          <li><strong>Essential cookies:</strong> Necessary for the website to function properly</li>
          <li><strong>Analytics cookies:</strong> Help us understand how users interact with the site</li>
          <li><strong>Functional cookies:</strong> Enable enhanced features and personalization</li>
        </ul>
      </Typography>
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