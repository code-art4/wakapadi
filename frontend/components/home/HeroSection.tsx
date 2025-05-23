// components/home/HeroSection.tsx
import { Autocomplete, TextField, Button, IconButton, useMediaQuery } from '@mui/material';
import { Search, PersonSearch, NearbyError, Menu } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

export default function HeroSection({
  locations,
  onSearch
}: {
  locations?: string[];
  onSearch?: (term: string) => void;
}) {
  const { t } = useTranslation('common');
  const [input, setInput] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:768px)');

  const debouncedSearch = useMemo(
    () => debounce((val: string) => onSearch?.(val), 400),
    [onSearch]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      setIsFixed(window.scrollY > heroRef.current.offsetHeight / 2);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    debouncedSearch(input);
    return () => debouncedSearch.cancel();
  }, [input, debouncedSearch]);

  return (
    <div className={styles.heroContainer} ref={heroRef}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>{t('homeTitle')}</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className={styles.heroSubtitle}>{t('homeSubtitle')}</p>
        </motion.div>
      </div>

      {/* Search Bar */}
      {locations && (
        <div className={`${styles.searchContainer} ${isFixed ? styles.fixed : ''}`}>
          <div className={styles.searchContent}>
            <div className={styles.searchInput}>
              <Search className={styles.searchIcon} />
              <Autocomplete
                freeSolo
                options={locations}
                getOptionLabel={(o) => o}
                inputValue={input}
                onInputChange={(_, val) => setInput(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t('searchPlaceholder') || 'Where to next?'}
                    variant="standard"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      className: styles.inputField
                    }}
                  />
                )}
              />
              {isMobile && (
                <IconButton 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={styles.mobileMenuButton}
                  aria-label="Toggle menu"
                >
                  <Menu />
                </IconButton>
              )}
            </div>
            
            {/* Buttons - always visible on desktop, conditional on mobile */}
            <div className={`${styles.searchButtons} ${!isMobile || mobileMenuOpen ? styles.visible : ''}`}>
              <Button
                variant="contained"
                startIcon={<PersonSearch />}
                onClick={() => router.push('/assistants')}
                className={styles.searchButton}
                fullWidth={isMobile}
              >
                {isMobile ? t('assistants') : t('findAssistants')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<NearbyError />}
                onClick={() => router.push('/whois')}
                className={styles.searchButton}
                fullWidth={isMobile}
              >
                {isMobile ? t('nearby') : t('whoisNearby')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}