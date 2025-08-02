import { memo } from 'react';
import { Skeleton, Box } from '@mui/material';
import TourCard from './TourCard';
import { Tour } from '../../pages';
import NoTours from './NoTours';
import styles from '../../styles/components/tour.module.css';

const Tours = ({
  loading,
  paginatedTours,
  search,
}: {
  loading: boolean;
  paginatedTours: Tour[];
  search: string;
}) => {
  const PER_PAGE = 12;

  return (
    <Box className={styles.tours}>
      {loading ? (
        Array.from({ length: PER_PAGE }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className={styles.gridItem}
            role='listitem'
          >
            <Skeleton
              variant='rectangular'
              className={styles.skeletonCard}
              height={380}
            />
          </div>
        ))
      ) : paginatedTours.length > 0 ? (
        <>
          <h2>Available Tours</h2>
          <div className={styles.tourGrid} role='list'>
            {paginatedTours?.map((tour: Tour) => (
              <div key={tour.id} className={styles.gridItem} role='listitem'>
                <TourCard
                  tour={tour}
                  highlight={search}
                  aria-label={`Tour to ${tour.location}`}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <NoTours search={search} />
      )}
    </Box>
  );
};

export default memo(Tours);
