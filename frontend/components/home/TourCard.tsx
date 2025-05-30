import { Card, CardContent, CardMedia, Typography, Button, Box, Skeleton } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Tour } from '../../pages';
import styles from './TourCard.module.css';
import Image from 'next/image';
import { useState } from 'react';

const highlightText = (text: string = '', highlight: string = '') => {
  if (!highlight || !text) return text;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      part
    )
  );
};
function extractPath(url:string):string {
  const parsed = new URL(url);
  return `/tours${parsed.pathname}`;
}

// const url = "https://www.freetour.com/berlin/alternative-berlin";
// console.log(extractPath(url));


export default function TourCard({ tour, highlight = '' }: { tour: Tour; highlight?: string }) {
  const { t } = useTranslation('common');
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <article className={styles.cardWrapper}>
      <Card className={styles.card} elevation={2}>
        {tour.image ? (
          <div className={styles.imageContainer}>
            {imageLoading && (
              <Skeleton 
                variant="rectangular" 
                className={styles.imageSkeleton} 
              />
            )}
            <Image
              src={tour.image}
              alt={tour.altText || tour.title}
              fill
              className={styles.cardImage}
              onLoadingComplete={() => setImageLoading(false)}
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              priority={false}
            />
          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <LocationOn className={styles.placeholderIcon} />
          </div>
        )}

        <CardContent className={styles.cardContent}>
          <Typography 
            variant="h3" 
            className={styles.cardTitle}
            component="h3"
          >
            {highlightText(tour.title, highlight)}
          </Typography>
          
          <Typography 
            className={styles.cardLocation}
            variant="body2"
          >
            {highlightText(tour.location, highlight)}
          </Typography>
          
          {tour.recurringSchedule && (
            <Typography 
              className={styles.cardSchedule}
              variant="body2"
            >
              <span className={styles.scheduleLabel}>{t('when')}:</span> {tour.recurringSchedule}
            </Typography>
          )}
          
          <Box className={styles.buttonContainer}>
            {tour.externalPageUrl && (
              <Button
                variant="outlined"
                href={extractPath(tour.externalPageUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardButton}
                aria-label={`More info about ${tour.title}`}
              >
                {t('moreInfo')}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </article>
  );
}