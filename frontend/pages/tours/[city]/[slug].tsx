// pages/tours/[city]/[slug].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/SingleTour.module.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Box,
  Typography,
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Rating,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import {
  Info as InfoIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Tour as TourIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as DurationIcon,
  Language as LanguageIcon,
  Money as PriceIcon,
  Place as MeetingPointIcon
} from '@mui/icons-material';
import { api } from '../../../lib/api/index';

interface TourData {
  title: string;
  tourRating: string;
  description: string;
  mainImage: (string | null)[];
  details: string[];
  provider: {
    name: string;
    url: string;
  };
  activities: string[];
  takeNote: string[];
  tourType: string | null;
  tourMap: string | null;
}

export default function SingleTourPage() {
  const router = useRouter();
  const { city, slug } = router.query;
  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (city && slug) {
      const fetchTour = async () => {
        try {
          const res = await api.post("/scraper/scrape-tour", { city, slug });
          if (res.data) {
            setTour(res.data);
          } else {
            setError(res.error || 'Failed to fetch tour');
          }
        } catch (err) {
          setError('Failed to connect to backend');
        } finally {
          setLoading(false);
        }
      };

      fetchTour();
    }
  }, [city, slug]);

  const handleSaveTour = () => {
    setIsSaved(!isSaved);
    // TODO: Implement actual save functionality
  };

  const handleShareTour = () => {
    if (navigator.share && tour) {
      navigator.share({
        title: `Check out this tour: ${tour.title}`,
        text: tour.description.substring(0, 100),
        url: window.location.href,
      }).catch(console.error);
    } else if (tour) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getDetailIcon = (detail: string) => {
    if (detail.includes('h') && detail.includes('min')) return <DurationIcon />;
    if (detail.toLowerCase().includes('english') || detail.toLowerCase().includes('german')) return <LanguageIcon />;
    if (detail.toLowerCase().includes('tip')) return <PriceIcon />;
    if (detail.toLowerCase().includes('town hall') || detail.toLowerCase().includes('meet')) return <MeetingPointIcon />;
    return <InfoIcon />;
  };

  const filteredImages = tour?.mainImage.filter(img => img !== null) as string[] || [];

  return (
    <Layout 
      title={`${tour?.title || 'Tour'} - Wakapadi`}
      description={tour?.description ? `${tour.description.substring(0, 160)}...` : 'Explore this walking tour with Wakapadi'}
    >
      <Box sx={{ 
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '300px',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body1">Loading tour details...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{
            textAlign: 'center',
            p: 4,
            border: '1px solid',
            borderColor: 'error.main',
            borderRadius: 2,
            maxWidth: '600px',
            mx: 'auto',
            my: 4
          }}>
            <WarningIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Failed to load tour
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </Box>
        ) : tour ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Button 
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{ color: 'text.secondary' }}
              >
                Back to results
              </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                {tour.title}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating
                    value={parseFloat(tour.tourRating)}
                    precision={0.1}
                    readOnly
                    icon={<StarIcon fontSize="inherit" />}
                    emptyIcon={<StarIcon fontSize="inherit" />}
                    sx={{ color: 'secondary.main', mr: 1 }}
                  />
                  <Typography variant="subtitle1" color="text.secondary">
                    {tour.tourRating}/10 ({tour.reviewCount || '0'} reviews)
                  </Typography>
                </Box>

                {tour.tourType && (
                  <Chip 
                    label={tour.tourType}
                    variant="outlined"
                    color="secondary"
                    size="small"
                  />
                )}

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <IconButton onClick={handleShareTour} color="primary">
                    <ShareIcon />
                  </IconButton>
                  <IconButton 
                    onClick={handleSaveTour} 
                    color={isSaved ? 'secondary' : 'default'}
                  >
                    <BookmarkIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {filteredImages.length > 0 && (
              <Box sx={{ 
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                position: 'relative',
                '&:hover .image-overlay': {
                  opacity: 1
                }
              }}>
                <img 
                  src={filteredImages[0]} 
                  alt={tour.title} 
                  style={{ 
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }} 
                />
                {filteredImages.length > 1 && (
                  <Box className="image-overlay" sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    p: 3,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}>
                    <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                      {filteredImages.length - 1} more photos available
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => {
                        // TODO: Implement gallery view
                      }}
                    >
                      View All Photos
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                whiteSpace: 'pre-line',
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: 'text.secondary',
                mb: 4
              }}
            >
              {tour.description}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { md: '1fr 1fr' },
              gap: 4,
              mb: 4
            }}>
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  '& svg': {
                    color: 'primary.main',
                    mr: 1
                  }
                }}>
                  <InfoIcon />
                  <Typography variant="h5" component="h2">
                    Tour Details
                  </Typography>
                </Box>
                
                <List disablePadding>
                  {tour.details?.map((item: string, idx: number) => (
                    <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getDetailIcon(item)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  '& svg': {
                    color: 'primary.main',
                    mr: 1
                  }
                }}>
                  <LocationOnIcon />
                  <Typography variant="h5" component="h2">
                    Highlights & Activities
                  </Typography>
                </Box>
                
                <List disablePadding>
                  {tour.activities?.map((item: string, idx: number) => (
                    <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationOnIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>

            {tour.takeNote?.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                <Box sx={{ 
                  mb: 4,
                  bgcolor: 'warning.light',
                  p: 3,
                  borderRadius: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    '& svg': {
                      color: 'warning.main',
                      mr: 1
                    }
                  }}>
                    <WarningIcon />
                    <Typography variant="h5" component="h2">
                      Important Notes
                    </Typography>
                  </Box>
                  
                  <List disablePadding>
                    {tour.takeNote.map((note: string, idx: number) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <WarningIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={note} 
                          primaryTypographyProps={{ 
                            variant: 'body1',
                            color: 'warning.dark'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            {tour.tourMap && (
              <>
                <Divider sx={{ my: 4 }} />
                <Box sx={{ 
                  mb: 4,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3,
                  height: '400px',
                  position: 'relative'
                }}>
                  <iframe 
                    src={tour.tourMap} 
                    width="100%" 
                    height="100%" 
                    loading="lazy"
                    style={{ border: 0 }}
                    title={`Map for ${tour.title}`}
                  />
                  
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      startIcon={<MapIcon />}
                      onClick={() => window.open(tour.tourMap as string, '_blank')}
                    >
                      Open in Maps
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                '& svg': {
                  color: 'primary.main',
                  mr: 1
                }
              }}>
                <InfoIcon />
                <Typography variant="h5" component="h2">
                  Tour Provider
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}>
                <Avatar 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(tour.provider.name)}&background=random`}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    fontSize: '2rem'
                  }}
                />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {tour.provider.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Verified tour provider
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    href={tour.provider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mr: 2 }}
                  >
                    Visit Website
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<InfoIcon />}
                  >
                    More Tours
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box sx={{
              bgcolor: 'primary.light',
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              mb: 4
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Ready to Experience This Tour?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Book now or contact the provider for more information
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                href={tour.provider.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Book Now
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<CalendarIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  ml: 2
                }}
              >
                Check Availability
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Layout>
  );
}