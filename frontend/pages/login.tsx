// pages/login.tsx
import { Container } from '@mui/material';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  return (
    <Container sx={{ mt: 6 }}>
      <AuthForm mode="login" />
    </Container>
  );
}
