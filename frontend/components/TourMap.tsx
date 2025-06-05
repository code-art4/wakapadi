// components/TourMap.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
  });
}

interface TourMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  className?: string; 
}

const TourMap: React.FC<TourMapProps> = ({ latitude, longitude, title, address, className }) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      className={className} // Apply CSS module class
      aria-label="Map showing tour location"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <strong>{title}</strong>
          {address && <br />}{address}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default TourMap;