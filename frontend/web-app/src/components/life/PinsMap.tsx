"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin } from '@/lib/types/life';
import L from 'leaflet';
import { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Fix for default marker icon in Next.js
// See: https://github.com/PaulLeCam/react-leaflet/issues/453
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PinsMapProps {
    pins: Pin[];
}

export default function PinsMap({ pins }: PinsMapProps) {
    // Filter pins that have coordinates
    const validPins = pins.filter(p => p.latitude !== undefined && p.longitude !== undefined && p.latitude !== 0 && p.longitude !== 0);

    // Default center (world view or average of pins)
    const center: [number, number] = validPins.length > 0
        ? [validPins[0].latitude!, validPins[0].longitude!]
        : [20, 0]; // Default to somewhere generally visible

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border/40 shadow-xl relative z-0">
            <MapContainer
                center={center}
                zoom={2}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                {/* Dark Matter Tile Layer for "Super Cool" look */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {validPins.map((pin) => (
                    <Marker
                        key={pin.id}
                        position={[pin.latitude!, pin.longitude!]}
                    >
                        <Popup className="custom-popup">
                            <div className="flex flex-col items-center gap-2 min-w-[150px]">
                                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary">
                                    {pin.image_url ? (
                                        <img src={pin.image_url} alt={pin.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {pin.name.substring(0, 1)}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-sm">{pin.name}</h3>
                                    {pin.visited_at && (
                                        <p className="text-xs text-muted-foreground">{new Date(pin.visited_at).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
