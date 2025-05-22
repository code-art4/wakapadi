import { Typography } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function PrivacyPolicy() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("privacyPolicy")}>
      <Typography variant="h4" gutterBottom>
        {t("privacyPolicy")}
      </Typography>
      <Typography paragraph>
        We value your privacy. Wakapadi collects only necessary information to improve
        your experience. We do not share your data with third parties unless required
        by law. By using our service, you consent to the practices described here.
      </Typography>
      <Typography variant="h6" gutterBottom>GDPR Compliance</Typography>
      <Typography paragraph>
        In accordance with the General Data Protection Regulation (GDPR), you have the right to access, rectify, or delete your personal data at any time. For such requests, please contact us at privacy@wakapadi.com.
      </Typography>
      <Typography variant="h6" gutterBottom>Your Rights</Typography>
      <Typography paragraph>
        You have the right to:
        <ul>
          <li>Request access to your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
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