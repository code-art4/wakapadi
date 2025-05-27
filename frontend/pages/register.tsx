// pages/register.tsx
import { Container } from '@mui/material';
import AuthForm from '../components/AuthForm';
import Layout from '../components/Layout';

export default function RegisterPage() {
  return (
    <Layout title='Registration Page - Wakapadi'><

    <Container sx={{ mt: 6 }}>
      <AuthForm mode="register" />
    </Container>
    </Layout>
  );
}
