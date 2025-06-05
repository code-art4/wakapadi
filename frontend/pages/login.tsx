// pages/login.tsx
import { Container } from '@mui/material';
import AuthForm from '../components/AuthForm';
import Layout from '../components/Layout';

export default function LoginPage() {
  return (
    <Layout title='Login Page - Wakapadi'>
    <Container sx={{ mt: 6 }}>
      <AuthForm />
    </Container>
    </Layout>
  );
}
