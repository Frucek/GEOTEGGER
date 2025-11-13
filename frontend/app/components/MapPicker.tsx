"use client";

import dynamic from "next/dynamic";
import type { LatLngLiteral } from "leaflet";

export interface MapPickerProps {
  value: LatLngLiteral | null;
  onChange: (value: LatLngLiteral | null) => void;
  className?: string;
}

const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
});

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />;
}
