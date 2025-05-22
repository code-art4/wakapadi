import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';

type Tour = {
  title: string;
  location: string;
  recurringSchedule?: string;
  externalPageUrl?: string;
  image?: string;
};

export default function TourCard({ tour }: { tour: Tour }) {
  const { t } = useTranslation('common');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {tour.image && (
        <CardMedia
          component="img"
          height="180"
          image={tour.image}
          alt={tour.title}
          loading="lazy"
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{tour.title}</Typography>
        <Typography color="text.secondary">{tour.location}</Typography>
        {tour.recurringSchedule && (
          <Typography mt={1}><strong>When:</strong> {tour.recurringSchedule}</Typography>
        )}
        {tour.externalPageUrl && (
          <Button
            variant="text"
            size="small"
            sx={{ mt: 2 }}
            href={tour.externalPageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('moreInfo')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
