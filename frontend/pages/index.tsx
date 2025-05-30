import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Box,Button, Typography, Grid, Pagination, Skeleton, Container, CircularProgress
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
  altText?: string; // Added for accessibility
};

export default function HomePage() {
  const { t } = useTranslation('common');
  const [tours, setTours] = useState<Tour[]>([]);
  const [search, setSearch] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { q } = router.query;

  // Memoized filtered tours calculation
  const { filteredTours, totalPages: calculatedPages } = useMemo(() => {
    if (!tours.length) return { filteredTours: [], totalPages: 1 };
  
    const filtered = search
      ? tours.filter(t => (
          t.location?.toLowerCase().includes(search.toLowerCase()) ||
          t.title?.toLowerCase().includes(search.toLowerCase())
        ))
      : tours;
  
    return {
      filteredTours: filtered,
      totalPages: Math.ceil(filtered.length / PER_PAGE) || 1
    };
  }, [tours, search]);

  // Fetch tours with error handling
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/tours');
        setTours(res.data);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError(t('fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchTours, 300); // Small delay for better perceived performance
    return () => clearTimeout(timer);
  }, [t]);

  // Handle search query from URL
  useEffect(() => {
    if (typeof q === 'string') {
      setSearch(q);
      setSuggestion(q);
      setPage(1);
    }
  }, [q]);

  // Debounced search with cleanup
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 400),
    []
  );

  const handleSearchInput = useCallback((value: string) => {
    setSuggestion(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Update total pages when filtered results change
  useEffect(() => {
    setTotalPages(calculatedPages);
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
    window.scrollTo({
      top: topRef.current?.offsetTop || 0,
      behavior: 'smooth'
    });
  }, []);

  const locations = useMemo(() => [...new Set(tours.map(t => t.location))], [tours]);

  return (
    <Layout title={t('homePageTitle')}>
      <div ref={topRef} className={styles.anchor} aria-hidden="true" />
      <HeroSection 
        locations={locations} 
        onSearch={handleSearchInput} 
        initialValue={typeof q === 'string' ? q : ''}
      />

      <Container maxWidth="lg" className={styles.tourContainer}>
        <Typography 
          variant="h2" 
          className={styles.sectionTitle}
          component="h2"
          aria-label={t('availableTours')}
        >
          {t('availableTours')}
        </Typography>

        {error ? (
          <Box className={styles.errorContainer}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              {t('retry')}
            </Button>
          </Box>
        ) : (
          <>
            <div className={styles.tourGrid}>
              {loading ? (
                Array.from({ length: PER_PAGE }).map((_, i) => (
                  <div key={`skeleton-${i}`} className={styles.gridItem}>
                    <Skeleton 
                      variant="rectangular" 
                      className={styles.skeletonCard} 
                      height={380}
                    />
                  </div>
                ))
              ) : (
                paginatedTours.map(tour => (
                  <div key={tour.id} className={styles.gridItem}>
                    <TourCard 
                      tour={tour} 
                      highlight={search} 
                      aria-label={`Tour to ${tour.location}`}
                    />
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
                  aria-label={t('paginationNavigation')}
                  classes={{
                    root: styles.paginationRoot,
                    ul: styles.paginationList
                  }}
                />
              </Box>
            )}
          </>
        )}

        {!loading && !error && filteredTours.length === 0 && (
          <Box className={styles.noResults}>
            <Typography variant="h5" className={styles.noResultsText}>
              {t('noToursFound')}
            </Typography>
            {search && (
              <Button 
                variant="text" 
                onClick={() => setSearch('')}
                className={styles.clearSearchButton}
              >
                {t('clearSearch')}
              </Button>
            )}
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