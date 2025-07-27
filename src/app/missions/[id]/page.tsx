'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { getAuth } from 'firebase/auth';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Waypoint, Telemetry, MissionDTO } from '@/types/dtos';
import { Feature, LineString } from 'geojson';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [mission, setMission] = useState<MissionDTO | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [status, setStatus] = useState<'pending'|'in_progress'|'paused'|'completed'|'aborted'>('pending');
  const mapRef = useRef<MapRef>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load mission data
  useEffect(() => {
    (async () => {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`http://localhost:4000/missions/${missionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMission(await res.json());
    })();
  }, [missionId]);

  // Hydrate last state
  useEffect(() => {
    if (!mission) return;
    (async () => {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`http://localhost:4000/missions/${missionId}/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const st = await res.json() as { status: string; progress: number; position?: Waypoint; };
      setStatus(st.status as any);
      if (st.position) {
        setTelemetry({
          missionId,
          status: st.status as any,
          progress: st.progress,
          position: st.position
        });
        mapRef.current?.getMap().jumpTo({
          center: [st.position.lng, st.position.lat],
          zoom: 14
        });
      }
    })();
  }, [mission, missionId]);

  // Subscribe to live updates
  useEffect(() => {
    if (!mission || status === 'pending') return;
    const socket = io('http://localhost:4000');
    socketRef.current = socket;
    socket.emit('join', missionId);

    socket.on('telemetry', (data: Telemetry) => {
      setTelemetry(data);
      setStatus(data.status);
      mapRef.current
        ?.getMap()
        .flyTo({ center: [data.position.lng, data.position.lat], speed: 0.6, curve: 1.2 });
    });

    return () => { socket.disconnect(); };
  }, [mission, status, missionId]);

  // Control commands
  const sendControl = async (cmd: 'start'|'pause'|'resume'|'abort') => {
    const token = await getAuth().currentUser?.getIdToken();
    const res = await fetch(`http://localhost:4000/missions/${missionId}/${cmd}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return;
    const body = await res.json() as { status: string };
    setStatus(body.status as any);
  };

  if (!mission) {
    return (
      <p style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading mission…
      </p>
    );
  }

  const first = mission.waypoints[0] ?? { lat: 0, lng: 0 };
  const initialViewState = { longitude: first.lng, latitude: first.lat, zoom: 14 };
  const pathGeoJSON: Feature<LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: mission.waypoints.map(wp => [wp.lng, wp.lat]),
    },
    properties: {},
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
      {/* Left Column: Map */}
      <div style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Map
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          ref={mapRef}
          style={{ width: '100%', height: '100%', minHeight: '500px' }}
        >
          <Source id="route" type="geojson" data={pathGeoJSON}>
            <Layer id="route-layer" type="line" paint={{ 'line-width': 3 }} />
          </Source>
          {telemetry && (
            <Marker latitude={telemetry.position.lat} longitude={telemetry.position.lng}>
              <div style={{
                width: '16px',
                height: '16px',
                background: 'red',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            </Marker>
          )}
        </Map>
      </div>

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
        }}>
          Mission {missionId}
        </h2>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            background: '#eee',
            width: '100%',
            height: '12px',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${telemetry?.progress || 0}%`,
              height: '100%',
              transition: 'width 0.5s',
              background: '#004080'
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 1rem' }}>
            Progress: {telemetry?.progress || 0}%
          </p>
        </div>

        {/* Status Badge */}
        <p style={{ marginBottom: '1.5rem' }}>
          Status:{' '}
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            background:
              status === 'in_progress' ? 'lightgreen' :
              status === 'paused'      ? 'gold'       :
              status === 'completed'   ? 'lightblue'  :
              status === 'aborted'     ? 'salmon'     :
                                        'lightgray'
          }}>
            {status.replace('_', ' ')}
          </span>
        </p>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          {status === 'pending' ? (
            <button
              onClick={() => sendControl('start')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#004080',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start Mission
            </button>
          ) : (
            <>
              <button
                disabled={status !== 'in_progress'}
                onClick={() => sendControl('pause')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#f0ad4e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: status === 'in_progress' ? 'pointer' : 'not-allowed'
                }}
              >
                Pause
              </button>
              <button
                disabled={status !== 'paused'}
                onClick={() => sendControl('resume')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#5cb85c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: status === 'paused' ? 'pointer' : 'not-allowed'
                }}
              >
                Resume
              </button>
              <button
                disabled={['completed', 'aborted'].includes(status)}
                onClick={() => sendControl('abort')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#d9534f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: ['completed', 'aborted'].includes(status) ? 'not-allowed' : 'pointer'
                }}
              >
                Abort
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
