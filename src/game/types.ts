import { PlayerPhysicsState, PickupData } from '../physics/evaluator';

import { ProjectileShape } from './abilities';

export interface PlayerEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  physicsState: PlayerPhysicsState;
  invulnerableTimer: number;
  lastFireTime: number;
  orbitAngle: number;
}

export interface ProjectileEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  piercing: boolean;
  piercedEnemyIds: Set<string>;
  shape: ProjectileShape;
}

export type EnemyType = 'scrapper' | 'inertial' | 'brute';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  speed: number;
  scoreValue: number;
  color: string;
  pulse: number;
}

export interface PickupEntity {
  id: string;
  data: PickupData;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  lifespan: number; // Seconds
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingNotification {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  size: number;
}

export interface TransformationRecordEntry {
  from: string;
  to: string;
  formula: string;
  title: string;
  timestamp: number;
}

export interface GameMetrics {
  score: number;
  wave: number;
  enemiesDefeated: number;
  transformationsCount: number;
  invalidCombinationsCount: number;
  timeAlive: number;
}

export interface ControlState {
  joystickActive: boolean;
  moveVector: { x: number; y: number }; // normalized -1 to 1
  autoShoot: boolean;
}
