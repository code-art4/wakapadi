// pages/login.tsx
import { Container } from '@mui/material';
import ContactForm from '../components/ContactForm';
import Layout from '../components/Layout';

export default function LoginPage() {
  return (
    <Layout title='Contact us Page - Wakapadi'>
    <Container sx={{ mt: 6 }}>
      <ContactForm  />
    </Container>
    </Layout>
  );
}
