import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '@/types';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
    locations: Location[];
    height?: string;
    center?: [number, number];
    zoom?: number;
    onLocationClick?: (location: Location) => void;
    showPopups?: boolean;
}

// Component to handle map center changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    
    useEffect(() => {
        if (center && center[0] !== 0 && center[1] !== 0) {
            map.setView(center, zoom);
        }
    }, [map, center, zoom]);
    
    return null;
}

export default function LocationMap({ 
    locations, 
    height = '400px', 
    center = [52.237049, 21.017532], // Warsaw, Poland default
    zoom = 10,
    onLocationClick,
    showPopups = true
}: LocationMapProps) {
    const mapRef = useRef<L.Map>(null);

    // Calculate bounds if we have locations with coordinates
    const locationsWithCoords = locations.filter(
        loc => loc.latitude && loc.longitude && 
               Number(loc.latitude) !== 0 && Number(loc.longitude) !== 0
    );

    // Calculate center from locations if available
    let mapCenter = center;
    let mapZoom = zoom;

    if (locationsWithCoords.length > 0) {
        if (locationsWithCoords.length === 1) {
            // Single location - center on it
            const loc = locationsWithCoords[0];
            mapCenter = [Number(loc.latitude), Number(loc.longitude)];
            mapZoom = 15;
        } else {
            // Multiple locations - calculate bounds
            const lats = locationsWithCoords.map(loc => Number(loc.latitude));
            const lngs = locationsWithCoords.map(loc => Number(loc.longitude));
            
            const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
            const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
            
            mapCenter = [centerLat, centerLng];
            mapZoom = 10;
        }
    }

    return (
        <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
            <link 
                rel="stylesheet" 
                href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                crossOrigin=""
            />
            <MapContainer
                ref={mapRef}
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <MapController center={mapCenter} zoom={mapZoom} />
                
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {locationsWithCoords.map((location) => {
                    const lat = Number(location.latitude);
                    const lng = Number(location.longitude);
                    
                    return (
                        <Marker
                            key={location.id}
                            position={[lat, lng]}
                        >
                            {showPopups && (
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                                        <p className="text-xs text-gray-600 mb-1">{location.location_type}</p>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {location.address}, {location.city}
                                        </p>
                                        {location.tenant?.name && (
                                            <p className="text-xs text-blue-600 mb-2">
                                                {location.tenant.name}
                                            </p>
                                        )}
                                        <div className="mb-3">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                location.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {location.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {onLocationClick && (
                                            <button
                                                onClick={() => onLocationClick(location)}
                                                className="w-full bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                            >
                                                Zobacz szczegóły
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}