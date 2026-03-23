'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerMapProps {
    onLocationSelected: (lat: number, lng: number) => void
    initialPosition?: [number, number]
}

function LocationMarker({ onLocationSelected, initialPosition }: LocationPickerMapProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialPosition ? new L.LatLng(initialPosition[0], initialPosition[1]) : null
    )

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            onLocationSelected(e.latlng.lat, e.latlng.lng)
        },
    })

    // Center map on initial position if provided
    useEffect(() => {
        if (initialPosition) {
            map.setView(initialPosition, map.getZoom())
        }
    }, [initialPosition, map])


    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

export default function LocationPickerMap({ onLocationSelected, initialPosition }: LocationPickerMapProps) {
    const defaultPosition: [number, number] = initialPosition || [20.5937, 78.9629] // Default to center of India

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200">
            <MapContainer
                center={defaultPosition}
                zoom={initialPosition ? 15 : 5}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelected={onLocationSelected} initialPosition={initialPosition} />
            </MapContainer>
        </div>
    )
}
