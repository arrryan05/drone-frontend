'use client';

import { useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MissionDTO, Waypoint } from '@/types/dtos';
import { getAuth } from 'firebase/auth';
import { FeatureCollection, LineString } from 'geojson';
import { MapLayerMouseEvent } from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

const missionSchema = z.object({
    altitude: z.number().min(1),
    overlap: z.number().min(0).max(100),
    pattern: z.enum(['grid', 'crosshatch', 'perimeter']),
});
type Form = z.infer<typeof missionSchema>;

export default function NewMissionPage() {
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [viewState, setViewState] = useState({ longitude: 0, latitude: 0, zoom: 2 });
    const { control, handleSubmit, formState: { errors } } = useForm<Form>({
        resolver: zodResolver(missionSchema),
        defaultValues: { altitude: 100, overlap: 20, pattern: 'grid' }
    });

    const handleMapClick = (evt: MapLayerMouseEvent) => {
        setWaypoints(wp => [...wp, { lat: evt.lngLat.lat, lng: evt.lngLat.lng }]);
    };
    const removeWaypoint = (i: number) => setWaypoints(wp => wp.filter((_, idx) => idx !== i));

    const onSubmit = async (data: Form) => {
        if (waypoints.length < 2) return alert('Add at least two waypoints.');
        const mission: MissionDTO = { waypoints, params: data };
        const token = await getAuth().currentUser?.getIdToken();
        const res = await fetch('http://localhost:4000/missions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(mission)
        });
        if (res.ok) {
            const { id } = await res.json();
            window.location.href = `/missions/${id}`;
        } else alert('Creation failed');
    };

    const pathGeoJSON: FeatureCollection<LineString> = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature' as const,
                geometry: {
                    type: 'LineString' as const,
                    // cast coordinates to [number, number][] so TS knows the tuple shape
                    coordinates: waypoints.map(wp => [wp.lng, wp.lat]) as [number, number][],
                },
                properties: {},
            },
        ],
    };

    return (
        <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
            <h1>New Mission</h1>

            <div style={{ height: 400, marginBottom: '1rem' }}>
                <Map
                    {...viewState}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    onMove={e => setViewState(e.viewState)}
                    onClick={handleMapClick}
                >
                    {waypoints.map((wp, i) => (
                        <Marker key={i} latitude={wp.lat} longitude={wp.lng}>
                            <div
                                onClick={e => { e.stopPropagation(); removeWaypoint(i); }}
                                style={{ width: 16, height: 16, background: 'red', borderRadius: '50%', cursor: 'pointer' }}
                            />
                        </Marker>
                    ))}

                    {waypoints.length >= 2 && (
                        <Source id="route" type="geojson" data={pathGeoJSON}>
                            <Layer id="route-layer" type="line" paint={{ 'line-width': 2 }} />
                        </Source>
                    )}
                </Map>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="altitude"
                    control={control}
                    render={({ field }) => (
                        <label>
                            Altitude (m)<br />
                            <input type="number" {...field} />
                            {errors.altitude && <span>{errors.altitude.message}</span>}
                        </label>
                    )}
                />
                <br />
                <Controller
                    name="overlap"
                    control={control}
                    render={({ field }) => (
                        <label>
                            Overlap (%)<br />
                            <input type="number" {...field} />
                            {errors.overlap && <span>{errors.overlap.message}</span>}
                        </label>
                    )}
                />
                <br />
                <Controller
                    name="pattern"
                    control={control}
                    render={({ field }) => (
                        <label>
                            Pattern<br />
                            <select {...field}>
                                <option value="grid">Grid</option>
                                <option value="crosshatch">Crosshatch</option>
                                <option value="perimeter">Perimeter</option>
                            </select>
                        </label>
                    )}
                />
                <br /><br />
                <button type="submit">Create Mission</button>
            </form>
        </main>
    );
}
