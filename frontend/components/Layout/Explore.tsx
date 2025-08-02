import { Box, Button, Typography } from '@mui/material';
import styles from '../../styles/components/explore.module.css';
import { useRouter } from 'next/router';

const Explore = () => {
  const router = useRouter();

  // const { t } = useTranslation('common');
  return (
    <Box className={styles.explore}>
      <Typography variant='h2'>Ready to Explore?</Typography>
      <Typography variant='body1'>
        Join thousands of travelers who have discovered authentic local
        experiences through Wakapadi.
      </Typography>
      <Button onClick={() => router.push('/register')}>
        Start your adventure
      </Button>
    </Box>
  );
};

export default Explore;
