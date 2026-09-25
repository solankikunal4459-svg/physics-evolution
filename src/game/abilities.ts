import { QuantityId } from '../physics/quantities';

export type ProjectileShape =
  | 'heavy_orb'
  | 'multi_tracer'
  | 'piercing_needle'
  | 'accelerating_bolt'
  | 'explosive_blast'
  | 'continuous_beam'
  | 'plasma_sphere'
  | 'graviton_pulse'
  | 'spiral_blade'
  | 'orbital_barrier'
  | 'helical_vortex'
  | 'boomerang_disk'
  | 'lightning_arc'
  | 'thermal_ring'
  | 'wavefront_ray'
  | 'magnetic_pulse';

export interface CombatStats {
  streams: number;           // Number of projectile streams
  spreadAngle: number;       // In radians
  fireInterval: number;      // Seconds between shots
  projectileSpeed: number;   // Pixels per second
  projectileDamage: number;  // Base damage
  projectileRadius: number;  // Visual and hit radius
  piercing: boolean;         // Whether bullets pass through enemies
  playerSpeed: number;       // Movement speed px/sec
  knockback: number;         // Impulse applied to enemies
  color: string;
  shape: ProjectileShape;
}

export const QUANTITY_COMBAT_CONFIG: Record<QuantityId, CombatStats> = {
  // ==========================================
  // 1. MECHANICS
  // ==========================================
  m: {
    streams: 1,
    spreadAngle: 0,
    fireInterval: 0.52,
    projectileSpeed: 450,
    projectileDamage: 45,
    projectileRadius: 9,
    piercing: false,
    playerSpeed: 210,
    knockback: 180,
    color: '#38bdf8',
    shape: 'heavy_orb',
  },
  v: {
    streams: 1,
    spreadAngle: 0,
    fireInterval: 0.17,
    projectileSpeed: 920,
    projectileDamage: 24,
    projectileRadius: 4,
    piercing: true,
    playerSpeed: 320,
    knockback: 40,
    color: '#34d399',
    shape: 'piercing_needle',
  },
  p: {
    streams: 3,
    spreadAngle: 0.22,
    fireInterval: 0.26,
    projectileSpeed: 560,
    projectileDamage: 28,
    projectileRadius: 5.5,
    piercing: false,
    playerSpeed: 230,
    knockback: 90,
    color: '#f59e0b',
    shape: 'multi_tracer',
  },
  a: {
    streams: 2,
    spreadAngle: 0.12,
    fireInterval: 0.22,
    projectileSpeed: 640,
    projectileDamage: 32,
    projectileRadius: 5,
    piercing: false,
    playerSpeed: 250,
    knockback: 110,
    color: '#ec4899',
    shape: 'accelerating_bolt',
  },
  F: {
    streams: 1,
    spreadAngle: 0,
    fireInterval: 0.58,
    projectileSpeed: 500,
    projectileDamage: 70,
    projectileRadius: 11,
    piercing: false,
    playerSpeed: 200,
    knockback: 350,
    color: '#ef4444',
    shape: 'explosive_blast',
  },
  J: {
    streams: 5,
    spreadAngle: 0.45,
    fireInterval: 0.48,
    projectileSpeed: 600,
    projectileDamage: 22,
    projectileRadius: 5,
    piercing: false,
    playerSpeed: 220,
    knockback: 220,
    color: '#fb923c',
    shape: 'explosive_blast',
  },
  W: {
    streams: 2,
    spreadAngle: 0.18,
    fireInterval: 0.55,
    projectileSpeed: 480,
    projectileDamage: 65,
    projectileRadius: 10,
    piercing: true,
    playerSpeed: 215,
    knockback: 240,
    color: '#a855f7',
    shape: 'plasma_sphere',
  },
  P: {
    streams: 3,
    spreadAngle: 0.08,
    fireInterval: 0.14,
    projectileSpeed: 780,
    projectileDamage: 22,
    projectileRadius: 4.5,
    piercing: false,
    playerSpeed: 240,
    knockback: 70,
    color: '#eab308',
    shape: 'continuous_beam',
  },

  // ==========================================
  // 2. ENERGY
  // ==========================================
  KE: {
    streams: 2,
    spreadAngle: 0.15,
    fireInterval: 0.35,
    projectileSpeed: 620,
    projectileDamage: 55,
    projectileRadius: 9,
    piercing: true,
    playerSpeed: 260,
    knockback: 160,
    color: '#06b6d4',
    shape: 'plasma_sphere',
  },
  PE: {
    streams: 1,
    spreadAngle: 0,
    fireInterval: 0.65,
    projectileSpeed: 420,
    projectileDamage: 90,
    projectileRadius: 13,
    piercing: false,
    playerSpeed: 195,
    knockback: 380,
    color: '#8b5cf6',
    shape: 'graviton_pulse',
  },

  // ==========================================
  // 3. ROTATIONAL
  // ==========================================
  theta: {
    streams: 3,
    spreadAngle: 0.35,
    fireInterval: 0.32,
    projectileSpeed: 520,
    projectileDamage: 28,
    projectileRadius: 6,
    piercing: false,
    playerSpeed: 240,
    knockback: 80,
    color: '#10b981',
    shape: 'spiral_blade',
  },
  omega: {
    streams: 4,
    spreadAngle: 0.5,
    fireInterval: 0.24,
    projectileSpeed: 580,
    projectileDamage: 24,
    projectileRadius: 5.5,
    piercing: true,
    playerSpeed: 270,
    knockback: 100,
    color: '#14b8a6',
    shape: 'spiral_blade',
  },
  alpha: {
    streams: 3,
    spreadAngle: 0.28,
    fireInterval: 0.22,
    projectileSpeed: 680,
    projectileDamage: 32,
    projectileRadius: 6,
    piercing: true,
    playerSpeed: 255,
    knockback: 120,
    color: '#f43f5e',
    shape: 'spiral_blade',
  },
  I_rot: {
    streams: 1,
    spreadAngle: 0,
    fireInterval: 0.70,
    projectileSpeed: 380,
    projectileDamage: 95,
    projectileRadius: 15,
    piercing: true,
    playerSpeed: 190,
    knockback: 400,
    color: '#6366f1',
    shape: 'orbital_barrier',
  },
  tau: {
    streams: 2,
    spreadAngle: 0.16,
    fireInterval: 0.38,
    projectileSpeed: 560,
    projectileDamage: 52,
    projectileRadius: 8,
    piercing: true,
    playerSpeed: 225,
    knockback: 220,
    color: '#d946ef',
    shape: 'helical_vortex',
  },
  L_rot: {
    streams: 2,
    spreadAngle: 0.25,
    fireInterval: 0.36,
    projectileSpeed: 540,
    projectileDamage: 48,
    projectileRadius: 8.5,
    piercing: true,
    playerSpeed: 235,
    knockback: 180,
    color: '#84cc16',
    shape: 'boomerang_disk',
  },

  // ==========================================
  // 4. ELECTROMAGNETISM
  // ==========================================
  q: {
    streams: 3,
    spreadAngle: 0.25,
    fireInterval: 0.25,
    projectileSpeed: 660,
    projectileDamage: 30,
    projectileRadius: 5,
    piercing: false,
    playerSpeed: 260,
    knockback: 85,
    color: '#38bdf8',
    shape: 'lightning_arc',
  },
  I_elec: {
    streams: 2,
    spreadAngle: 0.12,
    fireInterval: 0.18,
    projectileSpeed: 750,
    projectileDamage: 26,
    projectileRadius: 4.5,
    piercing: true,
    playerSpeed: 270,
    knockback: 90,
    color: '#facc15',
    shape: 'lightning_arc',
  },
  V: {
    streams: 2,
    spreadAngle: 0.18,
    fireInterval: 0.32,
    projectileSpeed: 700,
    projectileDamage: 50,
    projectileRadius: 7,
    piercing: true,
    playerSpeed: 245,
    knockback: 170,
    color: '#60a5fa',
    shape: 'lightning_arc',
  },
  R: {
    streams: 4,
    spreadAngle: 0.7,
    fireInterval: 0.45,
    projectileSpeed: 440,
    projectileDamage: 38,
    projectileRadius: 7.5,
    piercing: false,
    playerSpeed: 215,
    knockback: 160,
    color: '#fb7185',
    shape: 'thermal_ring',
  },
  E_field: {
    streams: 3,
    spreadAngle: 0.05,
    fireInterval: 0.38,
    projectileSpeed: 650,
    projectileDamage: 45,
    projectileRadius: 8,
    piercing: true,
    playerSpeed: 230,
    knockback: 190,
    color: '#c084fc',
    shape: 'wavefront_ray',
  },
  B_field: {
    streams: 2,
    spreadAngle: 0.22,
    fireInterval: 0.42,
    projectileSpeed: 580,
    projectileDamage: 48,
    projectileRadius: 9,
    piercing: true,
    playerSpeed: 235,
    knockback: 260,
    color: '#0ea5e9',
    shape: 'magnetic_pulse',
  },
};
