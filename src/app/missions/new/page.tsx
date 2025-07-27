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
    } else {
      alert('Creation failed');
    }
  };

  const pathGeoJSON: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map(wp => [wp.lng, wp.lat]) as [number, number][],
      },
      properties: {},
    }],
  };

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '1.5rem'
    }}>
      {/* LEFT: Map */}
      <div style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <Map
          {...viewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          onMove={e => setViewState(e.viewState)}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%', minHeight: '500px' }}
        >
          {waypoints.map((wp, i) => (
            <Marker key={i} latitude={wp.lat} longitude={wp.lng}>
              <div
                onClick={e => { e.stopPropagation(); removeWaypoint(i); }}
                style={{
                  width: '16px',
                  height: '16px',
                  background: 'red',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: '2px solid white'
                }}
              />
            </Marker>
          ))}

          {waypoints.length >= 2 && (
            <Source id="route" type="geojson" data={pathGeoJSON}>
              <Layer id="route-layer" type="line" paint={{ 'line-width': 3 }} />
            </Source>
          )}
        </Map>
      </div>

      {/* RIGHT: Form Panel */}
      <section style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{
          margin: 0,
          marginBottom: '1rem',
          fontSize: '1.5rem',
          borderBottom: '1px solid #eee',
          paddingBottom: '0.5rem'
        }}>Mission Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Altitude */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.25rem' }}>Altitude (m)</label>
            <Controller
              name="altitude"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  value={field.value}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              )}
            />
            {errors.altitude && (
              <span style={{ color: 'red', marginTop: '0.25rem' }}>
                {errors.altitude.message}
              </span>
            )}
          </div>

          {/* Overlap */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.25rem' }}>Overlap (%)</label>
            <Controller
              name="overlap"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  value={field.value}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              )}
            />
            {errors.overlap && (
              <span style={{ color: 'red', marginTop: '0.25rem' }}>
                {errors.overlap.message}
              </span>
            )}
          </div>

          {/* Pattern */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.25rem' }}>Pattern</label>
            <Controller
              name="pattern"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="grid">Grid</option>
                  <option value="crosshatch">Crosshatch</option>
                  <option value="perimeter">Perimeter</option>
                </select>
              )}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              marginTop: 'auto',
              padding: '0.75rem',
              backgroundColor: '#004080',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Create Mission
          </button>
        </form>
      </section>
    </main>
  );
}
