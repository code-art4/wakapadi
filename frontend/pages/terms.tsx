import { Typography } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function TermsOfUse() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("termsOfUse")}>
      <Typography variant="h4" gutterBottom>
        {t("termsOfUse")}
      </Typography>
      <Typography paragraph>
        By accessing Wakapadi, you agree to abide by our community guidelines,
        respect other users, and use the platform in good faith. We reserve the right
        to modify these terms at any time.
      </Typography>
      <Typography variant="h6" gutterBottom>Acceptable Use Policy</Typography>
      <Typography paragraph>
        Users must not engage in harmful behavior, spam, or misleading activity. Violations
        may result in suspension or permanent banning from the platform.
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