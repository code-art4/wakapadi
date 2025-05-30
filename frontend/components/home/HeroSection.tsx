import {
  Autocomplete,
  TextField,
  Button,
  IconButton,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  NearMe as NearMeIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  locations?: string[];
  onSearch?: (term: string) => void;
  initialValue?: string;
}

export default function HeroSection({ 
  locations = [], 
  onSearch, 
  initialValue = '' 
}: HeroSectionProps) {
  const { t } = useTranslation('common');
  const [input, setInput] = useState(initialValue);
  const [isFixed, setIsFixed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:768px)');

  // Debounced search
  useEffect(() => {
    const debounced = debounce((value: string) => {
      onSearch?.(value);
    }, 400);
    
    debounced(input);
    return () => debounced.cancel();
  }, [input, onSearch]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        setIsFixed(window.scrollY > heroRef.current.offsetHeight / 2);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.heroContainer} ref={heroRef}>
      {/* Hero Banner with Background Image */}
      <div className={styles.heroBanner}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>{t('homeTitle')}</h1>
        </motion.div>
        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {t('homeSubtitle')}
        </motion.p>
      </div>

      {/* Search Container */}
      <div 
      style={{
        zIndex:"1200",
      }}
        className={`${styles.searchContainer} ${isFixed ? styles.fixed : ''}`}
        aria-live="polite"
      >
        <div className={styles.searchContent}>
          <div className={styles.searchInput}>
            <SearchIcon className={styles.searchIcon} />
            <Autocomplete
              freeSolo
              options={locations}
              getOptionLabel={(option) => option}
              inputValue={input}
              onInputChange={(_, value) => setInput(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('searchPlaceholder')}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    className: styles.inputField,
                    'aria-label': 'Search tours'
                  }}
                />
              )}
              noOptionsText={t('noResults')}
            />
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={styles.mobileMenuButton}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <MenuIcon />
              </IconButton>
            )}
          </div>

          <div className={`${styles.searchButtons} ${mobileMenuOpen || !isMobile ? styles.visible : ''}`}>
            <Button
              variant="outlined"
              startIcon={<NearMeIcon />}
              onClick={() => router.push('/nearby')}
              className={styles.searchButton}
              fullWidth={isMobile}
            >
              {isMobile ? t('nearby') : t('findNearby')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}