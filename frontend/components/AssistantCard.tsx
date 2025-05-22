// components/AssistantCard.tsx
import { Card, CardContent, Typography, Chip, Stack } from '@mui/material';

type Props = {
  name: string;
  location: string;
  languages: string[];
  availability: string;
  experience: string;
  contactMethod: string;
};

export default function AssistantCard(props: Props) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{props.name}</Typography>
        <Typography variant="subtitle2" color="text.secondary">{props.location}</Typography>

        <Stack direction="row" spacing={1} mt={1}>
          {props.languages.map((lang, i) => (
            <Chip key={i} label={lang} size="small" />
          ))}
        </Stack>

        <Typography mt={1}><strong>Availability:</strong> {props.availability}</Typography>
        <Typography mt={1}><strong>Experience:</strong> {props.experience}</Typography>
        <Typography mt={1}><strong>Contact:</strong> {props.contactMethod}</Typography>
      </CardContent>
    </Card>
  );
}
