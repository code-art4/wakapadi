import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

export default function HeroSection() {
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        backgroundImage: 'url(/hero-travel.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: { xs: 240, md: 300 },
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
      }}
      role="banner"
    >
      <Box>
        <Typography variant="h4" fontWeight="bold">{t('homeTitle')}</Typography>
        <Typography variant="subtitle1" mt={1}>{t('homeSubtitle')}</Typography>
      </Box>
    </Box>
  );
}