// pages/register.tsx
import { Container } from '@mui/material';
import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
  return (
    <Container sx={{ mt: 6 }}>
      <AuthForm mode="register" />
    </Container>
  );
}
