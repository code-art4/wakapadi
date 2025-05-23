// components/home/TourCard.tsx
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Tour } from '../../pages/index';
import styles from './TourCard.module.css';

export default function TourCard({ tour, highlight = '' }: { tour: Tour; highlight?: string }) {
  const { t } = useTranslation('common');

  return (
    <div className={styles.cardWrapper}>
      <Card className={styles.card}>
        {tour.image && (
          <CardMedia
            component="img"
            image={tour.image}
            alt={tour.title}
            loading="lazy"
            className={styles.cardImage}
          />
        )}

        <CardContent className={styles.cardContent}>
          <Typography variant="h6" className={styles.cardTitle} title={tour.title}>
            {tour.title}
          </Typography>
          <Typography className={styles.cardLocation}>{tour.location}</Typography>
          
          {tour.recurringSchedule && (
            <Typography className={styles.cardSchedule}>
              <span className={styles.scheduleLabel}>{t('when')}:</span> {tour.recurringSchedule}
            </Typography>
          )}
          
          {tour.externalPageUrl && (
            <Button
              variant="outlined"
              href={tour.externalPageUrl}
              target="_blank"
              className={styles.cardButton}
            >
              {t('moreInfo')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}