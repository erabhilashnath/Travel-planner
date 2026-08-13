"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="26" height="34" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#f97316"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -30],
});

function FitToPlaces({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
  }, [map, bounds]);
  return null;
}

export function PlacesMap({ places }: { places: MapPlace[] }) {
  if (places.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-black/[.15] text-sm text-zinc-500 dark:border-white/[.2] dark:text-zinc-500">
        Add a place to see it on the map.
      </div>
    );
  }

  const path: [number, number][] = places.map((p) => [p.lat, p.lng]);
  const bounds = L.latLngBounds(path);

  return (
    <div className="h-72 overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPlaces bounds={bounds} />
        {places.length > 1 && (
          <Polyline positions={path} pathOptions={{ color: "#0d9488", weight: 3, dashArray: "6 8" }} />
        )}
        {places.map((place) => (
          <Marker key={place.id} position={[place.lat, place.lng]} icon={pinIcon}>
            <Popup>{place.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
