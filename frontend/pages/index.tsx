// pages/index.tsx
import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, TextField, Button, Stack, Pagination, Skeleton
} from '@mui/material';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HeroSection from '../components/home/HeroSection';
import TourCard from '../components/home/TourCard';

const PER_PAGE = 9;

type Tour = {
  title: string;
  location: string;
  recurringSchedule?: string;
  sourceUrl?: string;
  externalPageUrl?: string;
  image?: string;
};

export default function HomePage() {
  const { t } = useTranslation('common');
  const [tours, setTours] = useState<Tour[]>([]);
  const [featured, setFeatured] = useState<Tour[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const filtered = search
    ? tours.filter((t) => t.location?.toLowerCase().includes(search.toLowerCase()))
    : tours;

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    api.get('/tours').then((res) => {
      setTours(res.data);
      setFeatured([...res.data].sort(() => 0.5 - Math.random()).slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <HeroSection />

      {/* Search & Action Panel */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
        <TextField
          label={t('searchPlaceholder')}
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Button variant="contained" href="/assistants">
          {t('findAssistants')}
        </Button>
        <Button variant="outlined" href="/whois">
          {t('whoisNearby')}
        </Button>
      </Stack>

      {/* Featured Tours */}
      <Typography variant="h5" mt={5} mb={2}>{t('featuredTours')}</Typography>
      <Grid container spacing={3} mb={5}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={250} />
              </Grid>
            ))
          : featured.map((tour, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <TourCard tour={tour} />
              </Grid>
            ))}
      </Grid>

      {/* All Tours */}
      <Typography variant="h5" mb={2}>{t('availableTours')}</Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: PER_PAGE }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={250} />
              </Grid>
            ))
          : paginated.map((tour, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <TourCard tour={tour} />
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(filtered.length / PER_PAGE)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
