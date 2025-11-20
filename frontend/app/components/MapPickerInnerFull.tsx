"use client";

import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { MapPickerProps } from "./MapPicker";

const DEFAULT_CENTER: LatLngLiteral = { lat: 46.0569, lng: 14.5058 }; // Ljubljana

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationMarkerProps {
  value: LatLngLiteral | null;
  onChange: (value: LatLngLiteral | null) => void;
}

function LocationMarker({ value, onChange }: LocationMarkerProps) {
  useMapEvents({
    click(event) {
      onChange(event.latlng);
    },
  });

  if (!value) {
    return null;
  }

  return <Marker position={value} icon={markerIcon} />;
}

export default function MapPickerInnerFull({
  value,
  onChange,
  className,
}: MapPickerProps) {
  const center = useMemo<LatLngLiteral>(() => value ?? DEFAULT_CENTER, [value]);

  return (
    <div className={className + " h-full"}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "800px", width: "100%" }}
        className="rounded-none"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> prispevki'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
