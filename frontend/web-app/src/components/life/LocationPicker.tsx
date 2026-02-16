"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Fix for default marker icon in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

function LocationMarker({ onLocationSelect, initialPosition }: { onLocationSelect: (lat: number, lng: number) => void, initialPosition: [number, number] | null }) {
    const [position, setPosition] = useState<[number, number] | null>(initialPosition);

    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
            map.flyTo(initialPosition, map.getZoom());
        }
    }, [initialPosition, map]);


    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    // Default to a world view or user's approximate location if possible (e.g. via geolocation API later)
    // For now, default to (20, 0)
    const center: [number, number] = initialLat && initialLng && initialLat !== 0 && initialLng !== 0
        ? [initialLat, initialLng]
        : [20, 0];

    const zoom = initialLat && initialLng ? 13 : 2;

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border border-input relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    onLocationSelect={onLocationSelect}
                    initialPosition={initialLat && initialLng ? [initialLat, initialLng] : null}
                />
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm p-1 px-2 rounded text-xs z-[1000] pointer-events-none border shadow-sm">
                Click map to place pin
            </div>
        </div>
    );
}
