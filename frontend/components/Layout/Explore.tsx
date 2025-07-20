import { Box, Button, Typography } from '@mui/material';
import styles from '../../styles/components/explore.module.css';

const Explore = () => {
  return (
    <Box className={styles.explore}>
      <Typography variant='h2'>Ready to Explore?</Typography>
      <Typography variant='body1'>
        Join thousands of travelers who have discovered authentic local
        experiences through Wakapadi.
      </Typography>
      <Button>Start your adventure</Button>
    </Box>
  );
};

export default Explore;
