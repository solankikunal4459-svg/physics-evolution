import { PhysicalDimensions, DIMENSIONS } from './dimensions';
import { QuantityId, PHYSICAL_QUANTITIES } from './quantities';
import { PHYSICS_TRANSFORMATIONS, TransformationRule } from './transformations';

export interface PlayerPhysicsState {
  primaryQuantity: QuantityId;
  currentValue: number; // Value in SI unit of current primary quantity
  mass: number;         // kg
  velocity: number;     // m/s
  momentum: number;     // kg·m/s
  buffer: string[];     // Multi-step recipe buffer (e.g. ['g'] waiting for 'h')
}

export type PickupCategory = 'MODIFIER' | 'OPERATOR' | 'CALCULUS' | 'COEFFICIENT' | 'DISTRACTOR';

export interface PickupData {
  id: string;
  symbol: string;
  label: string;
  category: PickupCategory;
  targetQuantity?: QuantityId;
  deltaValue?: number;
  operandDimension: PhysicalDimensions;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare';
  domain?: 'Mechanics' | 'Energy' | 'Rotational' | 'Electromagnetism';
}

export interface EvaluationResult {
  valid: boolean;
  type: 'TRANSFORM' | 'MODIFY' | 'BUFFER' | 'INVALID';
  newPrimary?: QuantityId;
  updatedState?: Partial<PlayerPhysicsState>;
  transformationRule?: TransformationRule;
  title: string;
  message: string;
  formula?: string;
  dimensionsA?: string;
  dimensionsB?: string;
}

export class PhysicsEvaluator {
  /**
   * Evaluates what happens when the player in their current state collects a pickup.
   * Enforces dimensional analysis, dimensional homogeneity, and transformation rules.
   */
  static evaluate(state: PlayerPhysicsState, pickup: PickupData): EvaluationResult {
    const currentQInfo = PHYSICAL_QUANTITIES[state.primaryQuantity];
    const currentDims = currentQInfo.dimensions;

    // =========================================================================
    // CASE 1: Magnitude Modifiers (+m, -m, +v, +p, +F, etc.)
    // =========================================================================
    if (pickup.category === 'MODIFIER') {
      // PRINCIPLE OF DIMENSIONAL HOMOGENEITY:
      // Two quantities can only be added or subtracted if they have IDENTICAL dimensions!
      const isDimensionallyHomogeneous = currentDims.equals(pickup.operandDimension);

      if (!isDimensionallyHomogeneous) {
        return {
          valid: false,
          type: 'INVALID',
          title: 'DIMENSIONAL MISMATCH',
          message: `Cannot add or subtract '${pickup.symbol}' to ${currentQInfo.name} (${currentQInfo.symbol}). Dimensions ${currentDims.format()} and ${pickup.operandDimension.format()} are not homogeneous!`,
          dimensionsA: currentDims.format(),
          dimensionsB: pickup.operandDimension.format(),
        };
      }

      // If dimensions match, apply magnitude modification
      const delta = pickup.deltaValue || 1;
      const newCurrentVal = Math.max(1, Number((state.currentValue + delta).toFixed(1)));
      let newMass = state.mass;
      let newVelocity = state.velocity;
      let newMomentum = state.momentum;

      if (state.primaryQuantity === 'm') {
        newMass = newCurrentVal;
        newMomentum = Number((newMass * newVelocity).toFixed(1));
      } else if (state.primaryQuantity === 'v') {
        newVelocity = newCurrentVal;
        newMomentum = Number((newMass * newVelocity).toFixed(1));
      } else if (state.primaryQuantity === 'p') {
        newMomentum = newCurrentVal;
        newVelocity = Number((newMomentum / newMass).toFixed(1));
      }

      return {
        valid: true,
        type: 'MODIFY',
        title: delta > 0 ? 'MAGNITUDE INCREASE' : 'MAGNITUDE DECREASE',
        message: `${currentQInfo.name} adjusted by ${delta > 0 ? '+' : ''}${delta} ${currentQInfo.unitSymbol}.`,
        updatedState: {
          currentValue: newCurrentVal,
          mass: newMass,
          velocity: newVelocity,
          momentum: newMomentum,
        },
      };
    }

    // =========================================================================
    // CASE 2: Multi-Step Recipe Handling (Buffer)
    // =========================================================================
    // e.g., m + ×g -> buffered; then + ×h -> PE = mgh
    if (state.primaryQuantity === 'm' && pickup.symbol === '×g') {
      return {
        valid: true,
        type: 'BUFFER',
        title: 'GRAVITATIONAL COMPONENT ADDED',
        message: `Mass combined with acceleration of gravity: [m] × [g]. Collect height '×h' to complete Potential Energy (PE = mgh)!`,
        updatedState: {
          buffer: ['g'],
        },
      };
    }

    if (state.primaryQuantity === 'm' && state.buffer.includes('g') && pickup.symbol === '×h') {
      const peRule = PHYSICS_TRANSFORMATIONS.find(r => r.id === 'm_to_PE')!;
      const newPEVal = peRule.calculateValue(state.currentValue);
      return {
        valid: true,
        type: 'TRANSFORM',
        newPrimary: 'PE',
        transformationRule: peRule,
        title: `TRANSFORMATION: ${peRule.name}`,
        message: `${peRule.formula} (${peRule.educationalNote})`,
        formula: peRule.formula,
        updatedState: {
          primaryQuantity: 'PE',
          currentValue: newPEVal,
          buffer: [],
        },
      };
    }

    // =========================================================================
    // CASE 3: Single-Step Operator & Calculus Transformations
    // =========================================================================
    if (pickup.category === 'OPERATOR' || pickup.category === 'CALCULUS' || pickup.category === 'COEFFICIENT') {
      // Look up candidate transformation rules where inputQuantity matches current state
      const matchingRule = PHYSICS_TRANSFORMATIONS.find(rule => 
        rule.inputQuantity === state.primaryQuantity && 
        (rule.operatorSymbol === pickup.symbol || 
         rule.operatorSymbol === `×${pickup.symbol}` ||
         rule.operatorSymbol === pickup.symbol.replace(/^×/, ''))
      );

      if (matchingRule) {
        // Compute dimensional product
        const resultingDimension = currentDims.multiply(matchingRule.operandDimension);
        const targetQInfo = PHYSICAL_QUANTITIES[matchingRule.outputQuantity];

        // Rigorous dimensional validation:
        if (resultingDimension.equals(targetQInfo.dimensions)) {
          const newVal = matchingRule.calculateValue(state.currentValue);

          let updatedMass = state.mass;
          let updatedVelocity = state.velocity;
          let updatedMomentum = state.momentum;

          if (matchingRule.outputQuantity === 'm') updatedMass = newVal;
          if (matchingRule.outputQuantity === 'v') updatedVelocity = newVal;
          if (matchingRule.outputQuantity === 'p') updatedMomentum = newVal;

          return {
            valid: true,
            type: 'TRANSFORM',
            newPrimary: matchingRule.outputQuantity,
            transformationRule: matchingRule,
            title: `TRANSFORMATION: ${matchingRule.name}`,
            message: `${matchingRule.formula} (${matchingRule.educationalNote})`,
            formula: matchingRule.formula,
            updatedState: {
              primaryQuantity: matchingRule.outputQuantity,
              currentValue: newVal,
              mass: updatedMass,
              velocity: updatedVelocity,
              momentum: updatedMomentum,
              buffer: [],
            },
          };
        }
      }

      // Check special physical cases of invalid operator application
      const testDim = currentDims.multiply(pickup.operandDimension);
      if (testDim.isDimensionless() && state.primaryQuantity !== 'theta') {
        return {
          valid: false,
          type: 'INVALID',
          title: 'DIMENSIONLESS RESULT',
          message: `${currentQInfo.symbol} × (${pickup.symbol}) yields a pure scalar [Dimensionless]. A dynamic physical particle requires active dimensions!`,
          dimensionsA: currentDims.format(),
          dimensionsB: pickup.operandDimension.format(),
        };
      }

      // Generic invalid combination
      return {
        valid: false,
        type: 'INVALID',
        title: 'INVALID COMBINATION',
        message: `Applying operator '${pickup.symbol}' to ${currentQInfo.name} (${currentQInfo.symbol}) does not produce a defined Class 11–12 physical quantity. Dimensional result: ${testDim.format()}.`,
        dimensionsA: currentDims.format(),
        dimensionsB: pickup.operandDimension.format(),
      };
    }

    return {
      valid: false,
      type: 'INVALID',
      title: 'UNKNOWN INTERACTION',
      message: 'This object has no meaningful physical interaction with your current state.',
    };
  }
}
