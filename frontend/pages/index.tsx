// pages/index.tsx
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Box, Typography, Grid, Pagination, Skeleton, Container
} from '@mui/material';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HeroSection from '../components/home/HeroSection';
import TourCard from '../components/home/TourCard';
import { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
import styles from '../styles/HomePage.module.css';

const PER_PAGE = 12;

export type Tour = {
  id: string;
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
  const [search, setSearch] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { q } = router.query;

  // Fetch tours on mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await api.get('/tours');
        setTours(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Handle search query from URL
  useEffect(() => {
    if (typeof q === 'string') {
      setSearch(q);
      setSuggestion(q);
      setPage(1); // Reset to first page when search changes
    }
  }, [q]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value);
      setPage(1); // Reset to first page on search
    }, 400),
    []
  );

  const handleSearchInput = useCallback((value: string) => {
    setSuggestion(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Filter and paginate tours
  const { filteredTours, totalPages: calculatedPages } = useMemo(() => {
    const filtered = search
      ? tours.filter(t => 
          t.location?.toLowerCase().includes(search.toLowerCase()) ||
          t.title?.toLowerCase().includes(search.toLowerCase())
        )
      : tours;

    return {
      filteredTours: filtered,
      totalPages: Math.ceil(filtered.length / PER_PAGE) || 1
    };
  }, [tours, search]);

  // Update total pages when filtered results change
  useEffect(() => {
    setTotalPages(calculatedPages);
    // If current page is beyond new total pages, reset to last page
    if (page > calculatedPages && calculatedPages > 0) {
      setPage(calculatedPages);
    }
  }, [calculatedPages, page]);

  // Get paginated results
  const paginatedTours = useMemo(() => {
    return filteredTours.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  }, [filteredTours, page]);

  // Handle page change with scroll to top
  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Smooth scroll to top
    window.scrollTo({
      top: topRef.current?.offsetTop || 0,
      behavior: 'smooth'
    });
  }, []);

  const locations = useMemo(() => [...new Set(tours.map(t => t.location))], [tours]);

  return (
    <Layout title='Home Page - Wakapadi'>
      <div ref={topRef} className={styles.anchor} />
      <HeroSection locations={locations} onSearch={handleSearchInput} />

      <Container maxWidth="lg" className={styles.tourContainer}>
  <Typography variant="h2" className={styles.sectionTitle}>
    {t('availableTours')}
  </Typography>

  <div className={styles.tourGrid}>
    {loading ? (
      Array.from({ length: PER_PAGE }).map((_, i) => (
        <div key={`skeleton-${i}`} className={styles.gridItem}>
          <div className={styles.skeletonCard} />
        </div>
      ))
    ) : (
      paginatedTours.map(tour => (
        <div key={tour.id} className={styles.gridItem}>
          <TourCard tour={tour} highlight={search} />
        </div>
      ))
    )}
  </div>

        {!loading && totalPages > 1 && (
          <Box className={styles.paginationContainer}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              showFirstButton
              showLastButton
              classes={{
                root: styles.paginationRoot,
                ul: styles.paginationList
              }}
            />
          </Box>
        )}
      </Container>
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