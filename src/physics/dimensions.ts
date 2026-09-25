/**
 * Physics Dimensions System
 * Fundamental Base Dimensions (Class 11-12 SI Mechanics & Electrodynamics):
 * M = Mass
 * L = Length
 * T = Time
 * I = Electric Current
 * 
 * Any dynamic physical quantity has dimensions: [M^m L^l T^t I^i]
 */

export interface DimensionVector {
  M: number; // Mass exponent
  L: number; // Length exponent
  T: number; // Time exponent
  I: number; // Electric Current exponent
}

export class PhysicalDimensions {
  readonly M: number;
  readonly L: number;
  readonly T: number;
  readonly I: number;

  constructor(M: number = 0, L: number = 0, T: number = 0, I: number = 0) {
    this.M = M;
    this.L = L;
    this.T = T;
    this.I = I;
  }

  // Multiply dimensions: add exponents [M1 + M2, L1 + L2, T1 + T2, I1 + I2]
  multiply(other: PhysicalDimensions): PhysicalDimensions {
    return new PhysicalDimensions(
      this.M + other.M,
      this.L + other.L,
      this.T + other.T,
      this.I + other.I
    );
  }

  // Divide dimensions: subtract exponents [M1 - M2, L1 - L2, T1 - T2, I1 - I2]
  divide(other: PhysicalDimensions): PhysicalDimensions {
    return new PhysicalDimensions(
      this.M - other.M,
      this.L - other.L,
      this.T - other.T,
      this.I - other.I
    );
  }

  // Inverse dimensions: negative exponents [-M, -L, -T, -I]
  inverse(): PhysicalDimensions {
    return new PhysicalDimensions(-this.M, -this.L, -this.T, -this.I);
  }

  // Check dimensional homogeneity (equality)
  equals(other: PhysicalDimensions): boolean {
    return (
      this.M === other.M &&
      this.L === other.L &&
      this.T === other.T &&
      this.I === other.I
    );
  }

  // Is dimensionless: [M^0 L^0 T^0 I^0]
  isDimensionless(): boolean {
    return this.M === 0 && this.L === 0 && this.T === 0 && this.I === 0;
  }

  // Format as readable string: e.g. "[M L T⁻¹]" or "[M L² T⁻³ I⁻¹]"
  format(): string {
    if (this.isDimensionless()) return '[Dimensionless]';
    
    const parts: string[] = [];
    const formatExponent = (sym: string, exp: number) => {
      if (exp === 0) return '';
      if (exp === 1) return sym;
      const superscripts: Record<string, string> = {
        '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵'
      };
      const expStr = exp.toString().split('').map(c => superscripts[c] || c).join('');
      return `${sym}${expStr}`;
    };

    if (this.M !== 0) parts.push(formatExponent('M', this.M));
    if (this.L !== 0) parts.push(formatExponent('L', this.L));
    if (this.T !== 0) parts.push(formatExponent('T', this.T));
    if (this.I !== 0) parts.push(formatExponent('I', this.I));

    return `[${parts.join(' ')}]`;
  }
}

// Canonical Dimensions in Mechanics, Energy, Rotations & Electrodynamics
export const DIMENSIONS = {
  DIMENSIONLESS: new PhysicalDimensions(0, 0, 0, 0),
  MASS: new PhysicalDimensions(1, 0, 0, 0),                 // [M]
  LENGTH: new PhysicalDimensions(0, 1, 0, 0),               // [L]
  TIME: new PhysicalDimensions(0, 0, 1, 0),                 // [T]
  CURRENT: new PhysicalDimensions(0, 0, 0, 1),              // [I]
  VELOCITY: new PhysicalDimensions(0, 1, -1, 0),            // [L T⁻¹]
  ACCELERATION: new PhysicalDimensions(0, 1, -2, 0),        // [L T⁻²]
  MOMENTUM: new PhysicalDimensions(1, 1, -1, 0),            // [M L T⁻¹]
  FORCE: new PhysicalDimensions(1, 1, -2, 0),               // [M L T⁻²]
  IMPULSE: new PhysicalDimensions(1, 1, -1, 0),             // [M L T⁻¹]
  WORK_ENERGY: new PhysicalDimensions(1, 2, -2, 0),         // [M L² T⁻²]
  POWER: new PhysicalDimensions(1, 2, -3, 0),               // [M L² T⁻³]

  // Rotational Mechanics
  ANGULAR_DISPLACEMENT: new PhysicalDimensions(0, 0, 0, 0), // [Dimensionless]
  ANGULAR_VELOCITY: new PhysicalDimensions(0, 0, -1, 0),    // [T⁻¹]
  ANGULAR_ACCELERATION: new PhysicalDimensions(0, 0, -2, 0),// [T⁻²]
  MOMENT_OF_INERTIA: new PhysicalDimensions(1, 2, 0, 0),    // [M L²]
  TORQUE: new PhysicalDimensions(1, 2, -2, 0),              // [M L² T⁻²]
  ANGULAR_MOMENTUM: new PhysicalDimensions(1, 2, -1, 0),    // [M L² T⁻¹]

  // Electrodynamics
  CHARGE: new PhysicalDimensions(0, 0, 1, 1),               // [T I]
  VOLTAGE: new PhysicalDimensions(1, 2, -3, -1),            // [M L² T⁻³ I⁻¹]
  RESISTANCE: new PhysicalDimensions(1, 2, -3, -2),         // [M L² T⁻³ I⁻²]
  ELECTRIC_FIELD: new PhysicalDimensions(1, 1, -3, -1),     // [M L T⁻³ I⁻¹]
  MAGNETIC_FIELD: new PhysicalDimensions(1, 0, -2, -1),     // [M T⁻² I⁻¹]

  // Operators & Derivatives
  INVERSE_MASS: new PhysicalDimensions(-1, 0, 0, 0),        // [M⁻¹]
  INVERSE_TIME: new PhysicalDimensions(0, 0, -1, 0),        // [T⁻¹] (d/dt)
  INVERSE_CURRENT: new PhysicalDimensions(0, 0, 0, -1),     // [I⁻¹]
  INVERSE_VOLTAGE: new PhysicalDimensions(-1, -2, 3, 1),    // [M⁻¹ L⁻² T³ I]
  INVERSE_CHARGE: new PhysicalDimensions(0, 0, -1, -1),     // [T⁻¹ I⁻¹]
} as const;

