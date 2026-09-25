import { PhysicalDimensions, DIMENSIONS } from './dimensions';

export type QuantityId =
  | 'm'
  | 'v'
  | 'p'
  | 'a'
  | 'F'
  | 'J'
  | 'W'
  | 'P'
  | 'KE'
  | 'PE'
  | 'theta'
  | 'omega'
  | 'alpha'
  | 'I_rot'
  | 'tau'
  | 'L_rot'
  | 'q'
  | 'I_elec'
  | 'V'
  | 'R'
  | 'E_field'
  | 'B_field';

export type QuantityCategory = 'Mechanics' | 'Energy' | 'Rotational' | 'Electromagnetism';

export interface PhysicalQuantityInfo {
  id: QuantityId;
  name: string;
  symbol: string;
  unit: string;
  unitSymbol: string;
  classification: 'Base' | 'Derived';
  category: QuantityCategory;
  dimensions: PhysicalDimensions;
  formula: string;
  description: string;
  abilityDescription: string;
  color: string;
  accentColor: string;
  theme: {
    primary: string;
    glow: string;
    projectileColor: string;
  };
}

export const PHYSICAL_QUANTITIES: Record<QuantityId, PhysicalQuantityInfo> = {
  // ==========================================
  // 1. MECHANICS
  // ==========================================
  m: {
    id: 'm',
    name: 'Mass',
    symbol: 'm',
    unit: 'Kilogram',
    unitSymbol: 'kg',
    classification: 'Base',
    category: 'Mechanics',
    dimensions: DIMENSIONS.MASS,
    formula: 'Base quantity of inertial matter',
    description: 'A fundamental measure of the amount of matter in an object and its resistance to acceleration under net force.',
    abilityDescription: 'Fires heavy inertial orbs with massive mass-impact and steady trajectory.',
    color: '#38bdf8', // Sky Cyan
    accentColor: '#0284c7',
    theme: {
      primary: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.4)',
      projectileColor: '#7dd3fc',
    },
  },
  v: {
    id: 'v',
    name: 'Velocity',
    symbol: 'v',
    unit: 'Metres per second',
    unitSymbol: 'm/s',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.VELOCITY,
    formula: 'v = ds/dt = p/m = ∫a dt',
    description: 'The rate of change of displacement with respect to time. A vector describing speed in a definite direction.',
    abilityDescription: 'Hyper-fast piercing needles that puncture multiple targets in an instantaneous stream.',
    color: '#34d399', // Emerald Green
    accentColor: '#059669',
    theme: {
      primary: '#34d399',
      glow: 'rgba(52, 211, 153, 0.4)',
      projectileColor: '#a7f3d0',
    },
  },
  p: {
    id: 'p',
    name: 'Momentum',
    symbol: 'p',
    unit: 'Kilogram metre per second',
    unitSymbol: 'kg·m/s',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.MOMENTUM,
    formula: 'p = m × v = ∫F dt',
    description: 'The total quantity of motion of a moving body; the product of its mass and velocity. Strictly conserved in closed systems.',
    abilityDescription: '3-stream multi-tracer barrage providing sustained forward kinetic suppression.',
    color: '#f59e0b', // Amber
    accentColor: '#d97706',
    theme: {
      primary: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
      projectileColor: '#fde68a',
    },
  },
  a: {
    id: 'a',
    name: 'Acceleration',
    symbol: 'a',
    unit: 'Metres per second squared',
    unitSymbol: 'm/s²',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.ACCELERATION,
    formula: 'a = dv/dt = F/m',
    description: 'The rate of change of velocity over time. Arises when an unbalanced net force acts upon an inertial mass.',
    abilityDescription: 'Dual kinetic projectiles that continuously accelerate in flight, gaining velocity as they travel.',
    color: '#ec4899', // Pink
    accentColor: '#be185d',
    theme: {
      primary: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.4)',
      projectileColor: '#fbcfe8',
    },
  },
  F: {
    id: 'F',
    name: 'Force',
    symbol: 'F',
    unit: 'Newton',
    unitSymbol: 'N (kg·m/s²)',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.FORCE,
    formula: 'F = m × a = dp/dt = W/s',
    description: 'An interaction that causes an object to accelerate or alter its momentum. Governed by Newton’s Second Law.',
    abilityDescription: 'Tremendous impact shock-blasts that push back incoming swarms with extreme knockback.',
    color: '#ef4444', // Red
    accentColor: '#b91c1c',
    theme: {
      primary: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.4)',
      projectileColor: '#fca5a5',
    },
  },
  J: {
    id: 'J',
    name: 'Impulse',
    symbol: 'J',
    unit: 'Newton-second',
    unitSymbol: 'N·s (kg·m/s)',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.IMPULSE,
    formula: 'J = F × t = Δp',
    description: 'The integral of force over time, representing the total instantaneous transfer of momentum imparted by an impact.',
    abilityDescription: 'Short-burst explosive scattershot that shatters surrounding groups at close-to-medium range.',
    color: '#fb923c', // Orange
    accentColor: '#ea580c',
    theme: {
      primary: '#fb923c',
      glow: 'rgba(251, 146, 60, 0.4)',
      projectileColor: '#fed7aa',
    },
  },
  W: {
    id: 'W',
    name: 'Work',
    symbol: 'W',
    unit: 'Joule',
    unitSymbol: 'J (N·m)',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.WORK_ENERGY,
    formula: 'W = F × s = P × t',
    description: 'Energy transferred to or from an object via the application of force along a displacement.',
    abilityDescription: 'Concentrated energy-transfer spheres that detonate upon target contact, transferring work.',
    color: '#a855f7', // Purple
    accentColor: '#7e22ce',
    theme: {
      primary: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.4)',
      projectileColor: '#e9d5ff',
    },
  },
  P: {
    id: 'P',
    name: 'Power',
    symbol: 'P',
    unit: 'Watt',
    unitSymbol: 'W (J/s)',
    classification: 'Derived',
    category: 'Mechanics',
    dimensions: DIMENSIONS.POWER,
    formula: 'P = W / t = F · v = V × I',
    description: 'The rate at which work is done or energy is transformed per unit time.',
    abilityDescription: 'Rapid-fire high-frequency laser barrage with minimal cooldown and relentless throughput.',
    color: '#eab308', // Yellow
    accentColor: '#ca8a04',
    theme: {
      primary: '#eab308',
      glow: 'rgba(234, 179, 8, 0.4)',
      projectileColor: '#fef08a',
    },
  },

  // ==========================================
  // 2. ENERGY
  // ==========================================
  KE: {
    id: 'KE',
    name: 'Kinetic Energy',
    symbol: 'KE',
    unit: 'Joule',
    unitSymbol: 'J (kg·m²/s²)',
    classification: 'Derived',
    category: 'Energy',
    dimensions: DIMENSIONS.WORK_ENERGY,
    formula: 'KE = ½ × m × v² = p² / (2m)',
    description: 'The energy possessed by an object due to its macroscopic motion, scaling quadratically with speed.',
    abilityDescription: 'Blazing plasma cores that explode with radial kinetic shockwaves on contact.',
    color: '#06b6d4', // Cyan
    accentColor: '#0891b2',
    theme: {
      primary: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
      projectileColor: '#a5f3fc',
    },
  },
  PE: {
    id: 'PE',
    name: 'Potential Energy',
    symbol: 'PE',
    unit: 'Joule',
    unitSymbol: 'J (kg·m²/s²)',
    classification: 'Derived',
    category: 'Energy',
    dimensions: DIMENSIONS.WORK_ENERGY,
    formula: 'PE = m × g × h',
    description: 'Stored gravitational potential energy determined by an object’s mass, gravitational field, and vertical position.',
    abilityDescription: 'Gravitational distortion charges that pull nearby targets inward before detonating.',
    color: '#8b5cf6', // Violet
    accentColor: '#6d28d9',
    theme: {
      primary: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.4)',
      projectileColor: '#ddd6fe',
    },
  },

  // ==========================================
  // 3. ROTATIONAL MECHANICS
  // ==========================================
  theta: {
    id: 'theta',
    name: 'Angular Displacement',
    symbol: 'θ',
    unit: 'Radian',
    unitSymbol: 'rad',
    classification: 'Derived',
    category: 'Rotational',
    dimensions: DIMENSIONS.ANGULAR_DISPLACEMENT,
    formula: 'θ = s / r (Ratio of arc length to radius)',
    description: 'The angle in radians through which a point or line has been rotated in a specified sense about a specified axis.',
    abilityDescription: 'Orbital spiraling energy spheres that rotate around the player, shredding close threats.',
    color: '#10b981', // Emerald
    accentColor: '#047857',
    theme: {
      primary: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
      projectileColor: '#6ee7b7',
    },
  },
  omega: {
    id: 'omega',
    name: 'Angular Velocity',
    symbol: 'ω',
    unit: 'Radians per second',
    unitSymbol: 'rad/s (s⁻¹)',
    classification: 'Derived',
    category: 'Rotational',
    dimensions: DIMENSIONS.ANGULAR_VELOCITY,
    formula: 'ω = dθ/dt = v / r',
    description: 'The rate of change of angular position over time. Vector directed along the rotation axis by the right-hand rule.',
    abilityDescription: 'Rapid rotating energy chakrams that circle and deflect enemy projectiles while slicing targets.',
    color: '#14b8a6', // Teal
    accentColor: '#0f766e',
    theme: {
      primary: '#14b8a6',
      glow: 'rgba(20, 184, 166, 0.4)',
      projectileColor: '#99f6e4',
    },
  },
  alpha: {
    id: 'alpha',
    name: 'Angular Acceleration',
    symbol: 'α',
    unit: 'Radians per second squared',
    unitSymbol: 'rad/s² (s⁻²)',
    classification: 'Derived',
    category: 'Rotational',
    dimensions: DIMENSIONS.ANGULAR_ACCELERATION,
    formula: 'α = dω/dt = τ / I',
    description: 'The rate of change of angular velocity with respect to time produced by net external torque.',
    abilityDescription: 'Expanding spiral vortex cutters that widen in radius as they accelerate outward.',
    color: '#f43f5e', // Rose
    accentColor: '#be123c',
    theme: {
      primary: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.4)',
      projectileColor: '#fecdd3',
    },
  },
  I_rot: {
    id: 'I_rot',
    name: 'Moment of Inertia',
    symbol: 'I',
    unit: 'Kilogram metre squared',
    unitSymbol: 'kg·m²',
    classification: 'Derived',
    category: 'Rotational',
    dimensions: DIMENSIONS.MOMENT_OF_INERTIA,
    formula: 'I = m × r² = τ / α',
    description: 'Rotational inertia; quantitative measure of resistance to rotational acceleration about an axis.',
    abilityDescription: 'Heavy orbiting barrier rings that block incoming hostile fire and smash oncoming targets.',
    color: '#6366f1', // Indigo
    accentColor: '#4338ca',
    theme: {
      primary: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.4)',
      projectileColor: '#c7d2fe',
    },
  },
  tau: {
    id: 'tau',
    name: 'Torque',
    symbol: 'τ',
    unit: 'Newton-metre',
    unitSymbol: 'N·m',
    classification: 'Derived',
    category: 'Rotational',
    dimensions: DIMENSIONS.TORQUE,
    formula: 'τ = r × F = I × α = dL/dt',
    description: 'The rotational equivalent of linear force; moment of a force that tends to produce rotation.',
    abilityDescription: 'Twinned helical vortex beams that spiral together, generating destructive torsional shearing.',
    color: '#d946ef', // Fuchsia
    accentColor: '#a21caf',
    theme: {
      primary: '#d946ef',
      glow: 'rgba(217, 70, 239, 0.4)',
      projectileColor: '#f5d0fe',
    },
  },
  L_rot: {
    id: 'L_rot',
    name: 'Angular Momentum',
    symbol: 'L',
    unit: 'Kilogram metre squared per second',
    unitSymbol: 'kg·m²/s (J·s)',
    classification: 'Derived',
    category: 'Rotational',
    dimensions: DIMENSIONS.ANGULAR_MOMENTUM,
    formula: 'L = I × ω = r × p',
    description: 'Rotational momentum of a rotating body; conserved in any system free of external net torques.',
    abilityDescription: 'Sweeping rotational boomerang disks that curve across the battlefield and return.',
    color: '#84cc16', // Lime
    accentColor: '#4d7c0f',
    theme: {
      primary: '#84cc16',
      glow: 'rgba(132, 204, 22, 0.4)',
      projectileColor: '#d9f99d',
    },
  },

  // ==========================================
  // 4. ELECTRODYNAMICS & MAGNETISM
  // ==========================================
  q: {
    id: 'q',
    name: 'Electric Charge',
    symbol: 'q',
    unit: 'Coulomb',
    unitSymbol: 'C (A·s)',
    classification: 'Derived',
    category: 'Electromagnetism',
    dimensions: DIMENSIONS.CHARGE,
    formula: 'q = I × t = ∫I dt',
    description: 'Fundamental physical property of matter that causes it to experience a force in electromagnetic fields.',
    abilityDescription: 'Static electrostatic sparks that discharge into nearby targets with micro-stuns.',
    color: '#38bdf8', // Cyan
    accentColor: '#0284c7',
    theme: {
      primary: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.4)',
      projectileColor: '#bae6fd',
    },
  },
  I_elec: {
    id: 'I_elec',
    name: 'Electric Current',
    symbol: 'I',
    unit: 'Ampere',
    unitSymbol: 'A',
    classification: 'Base',
    category: 'Electromagnetism',
    dimensions: DIMENSIONS.CURRENT,
    formula: 'I = dq/dt = V / R = P / V',
    description: 'The rate of flow of electric charge past a specified point or region in a conductor.',
    abilityDescription: 'Continuous electric arc stream that chains continuously across sequential targets.',
    color: '#facc15', // Amber-yellow
    accentColor: '#ca8a04',
    theme: {
      primary: '#facc15',
      glow: 'rgba(250, 204, 21, 0.4)',
      projectileColor: '#fef08a',
    },
  },
  V: {
    id: 'V',
    name: 'Electric Potential',
    symbol: 'V',
    unit: 'Volt',
    unitSymbol: 'V (J/C)',
    classification: 'Derived',
    category: 'Electromagnetism',
    dimensions: DIMENSIONS.VOLTAGE,
    formula: 'V = W / q = I × R = P / I',
    description: 'The work needed per unit of charge to move a charge from a reference point to a specified location.',
    abilityDescription: 'High-voltage lightning discharges that fork into destructive branch arcs.',
    color: '#60a5fa', // Blue
    accentColor: '#2563eb',
    theme: {
      primary: '#60a5fa',
      glow: 'rgba(96, 165, 250, 0.4)',
      projectileColor: '#bfdbfe',
    },
  },
  R: {
    id: 'R',
    name: 'Resistance',
    symbol: 'R',
    unit: 'Ohm',
    unitSymbol: 'Ω (V/A)',
    classification: 'Derived',
    category: 'Electromagnetism',
    dimensions: DIMENSIONS.RESISTANCE,
    formula: 'R = V / I = P / I²',
    description: 'A measure of the opposition to current flow in an electrical circuit, converting electrical energy into heat.',
    abilityDescription: 'Joule-heating thermal rings that melt enemy armor within a short protective radius.',
    color: '#fb7185', // Coral
    accentColor: '#e11d48',
    theme: {
      primary: '#fb7185',
      glow: 'rgba(251, 113, 133, 0.4)',
      projectileColor: '#fecdd3',
    },
  },
  E_field: {
    id: 'E_field',
    name: 'Electric Field',
    symbol: 'E',
    unit: 'Volt per metre',
    unitSymbol: 'V/m (N/C)',
    classification: 'Derived',
    category: 'Electromagnetism',
    dimensions: DIMENSIONS.ELECTRIC_FIELD,
    formula: 'E = F / q = -dV/dr',
    description: 'The physical field that surrounds electrically charged particles and exerts force on all other charges in the field.',
    abilityDescription: 'Parallel wavefront rays that sweep across the entire height of the screen.',
    color: '#c084fc', // Light Purple
    accentColor: '#9333ea',
    theme: {
      primary: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.4)',
      projectileColor: '#f3e8ff',
    },
  },
  B_field: {
    id: 'B_field',
    name: 'Magnetic Field',
    symbol: 'B',
    unit: 'Tesla',
    unitSymbol: 'T (N/(A·m))',
    classification: 'Derived',
    category: 'Electromagnetism',
    dimensions: DIMENSIONS.MAGNETIC_FIELD,
    formula: 'B = F / (q × v) = F / (I × L)',
    description: 'A vector field describing magnetic influence of moving electrical charges and magnetic materials (Lorentz force).',
    abilityDescription: 'Lorentz magnetic pulses that deflect enemy projectiles and pull metallic foes off trajectory.',
    color: '#0ea5e9', // Cyan-Blue
    accentColor: '#0284c7',
    theme: {
      primary: '#0ea5e9',
      glow: 'rgba(14, 165, 233, 0.4)',
      projectileColor: '#7dd3fc',
    },
  },
};
