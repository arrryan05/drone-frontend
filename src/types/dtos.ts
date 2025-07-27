export interface Waypoint {
  lat: number;
  lng: number;
}

export interface MissionDTO {
  id?: string;
  waypoints: Waypoint[];
  params: {
    altitude: number;
    overlap: number;
    pattern: 'grid' | 'crosshatch' | 'perimeter';
  };
}

export interface Telemetry {
  missionId: string;
  position: Waypoint;
  progress: number;             // 0–100
  status: 'in_progress' | 'completed';
}
