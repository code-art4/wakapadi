import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Tour } from '../../pages';
import styles from './TourCard.module.css';
import Image from 'next/image';
import { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { formattedTime } from '../../utils/formatTime';

// const highlightText = (text: string = '', highlight: string = '') => {
//   if (!highlight || !text) return text;

//   const regex = new RegExp(`(${highlight})`, 'gi');
//   const parts = text.split(regex);

//   return parts.map((part, i) =>
//     regex.test(part) ? (
//       <mark key={i} className={styles.highlight}>
//         {part}
//       </mark>
//     ) : (
//       part
//     )
//   );
// };
function extractPath(url: string): string {
  const parsed = new URL(url);
  return `/tours${parsed.pathname}`;
}

export default function TourCard({
  tour,
  highlight = '',
}: {
  tour: Tour;
  highlight?: string;
}) {
  const { t } = useTranslation('common');
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <article className={styles.cardWrapper}>
      <Card className={styles.card} elevation={2}>
        {tour.image ? (
          <div className={styles.imageContainer}>
            {imageLoading && (
              <Skeleton
                variant='rectangular'
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
              // sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              priority={false}
            />
          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <LocationOnIcon className={styles.placeholderIcon} />
          </div>
        )}

        <CardContent className={styles.cardContent}>
          <Typography className={styles.cardLocation} variant='body2'>
            {tour.location?.city + ', ' + tour.location?.country}
            {/* {highlightText(tour.location, highlight)} */}
          </Typography>

          <Typography
            variant='h5'
            className={styles.cardTitle}
            component='h5' // Use 'strong' to emphasize the title
          >
            {tour.title}
            {/* {highlightText(tour.title, highlight)} */}
          </Typography>

          <Typography variant='body2' className={styles.cardTimeline}>
            <WatchLaterIcon width='1rem' height='1rem' />
            <span className={styles.cardTimelineText}>
              {formattedTime(tour.startDate)}
            </span>
            <span className={styles.cardTimelineText}>
              {formattedTime(tour.endDate)}
            </span>
          </Typography>

          {/* <Box className={styles.buttonContainer}>
            {tour.externalPageUrl && (
              <Button
                variant='outlined'
                href={extractPath(tour.externalPageUrl)}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.cardButton}
                aria-label={`More info about ${tour.title}`}
              >
                {t('moreInfo')}
              </Button>
            )}
          </Box> */}
        </CardContent>
      </Card>
    </article>
  );
}
