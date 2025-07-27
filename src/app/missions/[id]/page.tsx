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
  // Coerce id to string
  const params = useParams();
  const missionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [mission, setMission] = useState<MissionDTO | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [status, setStatus] = useState<'pending'|'in_progress'|'paused'|'completed'|'aborted'>('pending');
  const mapRef = useRef<MapRef>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load mission DTO
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
      const st = await res.json() as {
        status: string;
        progress: number;
        position?: Waypoint;
      };
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

  // Subscribe after start
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

  // Control actions
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

  if (!mission) return <p>Loading mission…</p>;

  // initial view
  const first = mission.waypoints[0] ?? { lat: 0, lng: 0 };
  const initialViewState = { longitude: first.lng, latitude: first.lat, zoom: 14 };

  // typed Feature<LineString>
  const pathGeoJSON: Feature<LineString> = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString',
      coordinates: mission.waypoints.map(wp => [wp.lng, wp.lat]),
    },
    properties: {},
  };

  return (
    <main style={{ padding:'1rem', fontFamily:'sans-serif' }}>
      <h1>Mission {missionId}</h1>

      <div style={{ height:400, marginBottom:'1rem' }}>
        <Map
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          ref={mapRef}
        >
          <Source
            id="route"
            type="geojson"
            data={pathGeoJSON}
          >
            <Layer id="route-layer" type="line" paint={{ 'line-width': 3 }} />
          </Source>

          {telemetry && (
            <Marker latitude={telemetry.position.lat} longitude={telemetry.position.lng}>
              <div style={{ width:16, height:16, background:'red', borderRadius:'50%' }} />
            </Marker>
          )}
        </Map>
      </div>

      <div style={{ background:'#eee', width:'100%', height:8, marginBottom:8 }}>
        <div style={{
          width:`${telemetry?.progress||0}%`,
          height:'100%', transition:'width 0.5s',
          background:'#007bff'
        }} />
      </div>
      <p>Progress: {telemetry?.progress||0}%</p>

      <p>
        Status: <span style={{
          padding:'0.25rem 0.5rem', borderRadius:4,
          background:
            status==='in_progress'?'lightgreen':
            status==='paused'?'gold':
            status==='completed'?'lightblue':
            status==='aborted'?'salmon':'lightgray'
        }}>
          {status}
        </span>
      </p>

      <div style={{ marginTop:'1rem' }}>
        {status==='pending' ? (
          <button onClick={()=>sendControl('start')}>Start Mission</button>
        ) : (
          <>
            <button disabled={status!=='in_progress'} onClick={()=>sendControl('pause')}>Pause</button>{' '}
            <button disabled={status!=='paused'} onClick={()=>sendControl('resume')}>Resume</button>{' '}
            <button disabled={['completed','aborted'].includes(status)} onClick={()=>sendControl('abort')}>Abort</button>
          </>
        )}
      </div>
    </main>
  );
}
