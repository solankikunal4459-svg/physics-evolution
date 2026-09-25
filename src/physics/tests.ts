/**
 * Comprehensive Internal Physics Test Suite
 * Validates dimensional homogeneity, transformation rules, calculus operations,
 * multi-step recipes, and rejection of invalid combinations.
 */

import { DIMENSIONS } from './dimensions';
import { PHYSICAL_QUANTITIES, QuantityId } from './quantities';
import { PHYSICS_TRANSFORMATIONS } from './transformations';
import { PhysicsEvaluator, PlayerPhysicsState, PickupData } from './evaluator';
import { GAME_PICKUPS } from './pickups';

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runPhysicsValidationTests(): { allPassed: boolean; results: TestResult[] } {
  const results: TestResult[] = [];

  const assert = (name: string, condition: boolean, details: string) => {
    results.push({
      name,
      passed: condition,
      details,
    });
  };

  // Helper to make mock state
  const makeState = (primary: QuantityId, val: number = 10, buffer: string[] = []): PlayerPhysicsState => ({
    primaryQuantity: primary,
    currentValue: val,
    mass: 5,
    velocity: 15,
    momentum: 75,
    buffer,
  });

  // Helper to find pickup by symbol
  const findPickup = (symbol: string): PickupData => {
    const p = GAME_PICKUPS.find(item => item.symbol === symbol);
    if (!p) throw new Error(`Pickup with symbol ${symbol} not found!`);
    return p;
  };

  // -------------------------------------------------------------
  // Test 1: m × v → p
  // -------------------------------------------------------------
  {
    const state = makeState('m');
    const pickup = findPickup('×v');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('m × v → p', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'p',
      `Expected transform to 'p', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 2: p × 1/m → v
  // -------------------------------------------------------------
  {
    const state = makeState('p');
    const pickup = findPickup('1/m');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('p × 1/m → v', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'v',
      `Expected transform to 'v', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 3: v × d/dt → a
  // -------------------------------------------------------------
  {
    const state = makeState('v');
    const pickup = findPickup('d/dt');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('v × d/dt → a', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'a',
      `Expected transform to 'a', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 4: a × m → F
  // -------------------------------------------------------------
  {
    const state = makeState('a');
    const pickup = findPickup('×m');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('a × m → F', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'F',
      `Expected transform to 'F', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 5: p × d/dt → F
  // -------------------------------------------------------------
  {
    const state = makeState('p');
    const pickup = findPickup('d/dt');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('p × d/dt → F', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'F',
      `Expected transform to 'F', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 6: F × t → J
  // -------------------------------------------------------------
  {
    const state = makeState('F');
    const pickup = findPickup('×t');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('F × t → J', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'J',
      `Expected transform to 'J', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 7: J / t → F
  // -------------------------------------------------------------
  {
    const state = makeState('J');
    const pickup = findPickup('/t');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('J / t → F', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'F',
      `Expected transform to 'F', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 8: F × s → W
  // -------------------------------------------------------------
  {
    const state = makeState('F');
    const pickup = findPickup('×s');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('F × s → W', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'W',
      `Expected transform to 'W', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 9: W / t → P
  // -------------------------------------------------------------
  {
    const state = makeState('W');
    const pickup = findPickup('/t');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('W / t → P', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'P',
      `Expected transform to 'P', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 10: P × t → W
  // -------------------------------------------------------------
  {
    const state = makeState('P');
    const pickup = findPickup('×t');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('P × t → W', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'W',
      `Expected transform to 'W', got ${res.newPrimary} (${res.message})`);
  }

  // -------------------------------------------------------------
  // Test 11: m × (½v²) → KE
  // -------------------------------------------------------------
  {
    const state = makeState('m');
    const pickup = findPickup('×(½v²)');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('m × (½v²) → KE', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'KE',
      `Expected transform to 'KE', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 12: m × g × h → PE (Multi-step buffer)
  // -------------------------------------------------------------
  {
    const state = makeState('m');
    const pickupG = findPickup('×g');
    const resG = PhysicsEvaluator.evaluate(state, pickupG);
    const isBuffered = resG.valid && resG.type === 'BUFFER' && resG.updatedState?.buffer?.includes('g');
    
    const stateWithG = makeState('m', 10, ['g']);
    const pickupH = findPickup('×h');
    const resH = PhysicsEvaluator.evaluate(stateWithG, pickupH);
    const isPE = resH.valid && resH.type === 'TRANSFORM' && resH.newPrimary === 'PE';

    assert('m × g × h → PE (Multi-step)', isBuffered && isPE,
      `Step 1 buffer: ${isBuffered}, Step 2 transform to PE: ${isPE}`);
  }

  // -------------------------------------------------------------
  // Test 13: θ × d/dt → ω
  // -------------------------------------------------------------
  {
    const state = makeState('theta');
    const pickup = findPickup('d/dt');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('θ × d/dt → ω', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'omega',
      `Expected transform to 'omega', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 14: ω × d/dt → α
  // -------------------------------------------------------------
  {
    const state = makeState('omega');
    const pickup = findPickup('d/dt');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('ω × d/dt → α', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'alpha',
      `Expected transform to 'alpha', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 15: I × α → τ
  // -------------------------------------------------------------
  {
    const state = makeState('I_rot');
    const pickup = findPickup('×α');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('I × α → τ', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'tau',
      `Expected transform to 'tau', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 16: I × ω → L
  // -------------------------------------------------------------
  {
    const state = makeState('I_rot');
    const pickup = findPickup('×ω');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('I × ω → L', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'L_rot',
      `Expected transform to 'L_rot', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 17: L × d/dt → τ
  // -------------------------------------------------------------
  {
    const state = makeState('L_rot');
    const pickup = findPickup('d/dt');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('L × d/dt → τ', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'tau',
      `Expected transform to 'tau', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 18: q × d/dt → I
  // -------------------------------------------------------------
  {
    const state = makeState('q');
    const pickup = findPickup('d/dt');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('q × d/dt → I', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'I_elec',
      `Expected transform to 'I_elec', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 19: V × I → P
  // -------------------------------------------------------------
  {
    const state = makeState('V');
    const pickup = findPickup('×I');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('V × I → P', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'P',
      `Expected transform to 'P', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 20: V / I → R
  // -------------------------------------------------------------
  {
    const state = makeState('V');
    const pickup = findPickup('/I');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('V / I → R', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'R',
      `Expected transform to 'R', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 21: I × R → V
  // -------------------------------------------------------------
  {
    const state = makeState('I_elec');
    const pickup = findPickup('×R');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('I × R → V', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'V',
      `Expected transform to 'V', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 22: q × V → W (Energy)
  // -------------------------------------------------------------
  {
    const state = makeState('q');
    const pickup = findPickup('×V');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('q × V → W', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'W',
      `Expected transform to 'W', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 23: q × E → F
  // -------------------------------------------------------------
  {
    const state = makeState('q');
    const pickup = findPickup('×E');
    const res = PhysicsEvaluator.evaluate(state, pickup);
    assert('q × E → F', res.valid && res.type === 'TRANSFORM' && res.newPrimary === 'F',
      `Expected transform to 'F', got ${res.newPrimary}`);
  }

  // -------------------------------------------------------------
  // Test 24: INVALID COMBINATIONS (Must be rejected)
  // m + v
  // m + F
  // p + t
  // F + v
  // -------------------------------------------------------------
  {
    // m + v
    const stateM = makeState('m');
    const pickupV = findPickup('+v');
    const resMV = PhysicsEvaluator.evaluate(stateM, pickupV);
    assert('Reject invalid: m + v', !resMV.valid && resMV.type === 'INVALID',
      `Rejected as expected: ${resMV.message}`);

    // m + F
    const pickupF = findPickup('+F');
    const resMF = PhysicsEvaluator.evaluate(stateM, pickupF);
    assert('Reject invalid: m + F', !resMF.valid && resMF.type === 'INVALID',
      `Rejected as expected: ${resMF.message}`);

    // p + t (operator ×t is valid for F, but adding time +t to p is dimensionally illegal)
    const mockPickupPlusT: PickupData = {
      id: 'plus_t',
      symbol: '+t',
      label: '+Time (+1 s)',
      category: 'MODIFIER',
      deltaValue: 1,
      operandDimension: DIMENSIONS.TIME,
      color: '#fff',
      rarity: 'common',
    };
    const stateP = makeState('p');
    const resPT = PhysicsEvaluator.evaluate(stateP, mockPickupPlusT);
    assert('Reject invalid: p + t', !resPT.valid && resPT.type === 'INVALID',
      `Rejected as expected: ${resPT.message}`);

    // F + v
    const stateF = makeState('F');
    const resFV = PhysicsEvaluator.evaluate(stateF, pickupV);
    assert('Reject invalid: F + v', !resFV.valid && resFV.type === 'INVALID',
      `Rejected as expected: ${resFV.message}`);
  }


  // -------------------------------------------------------------
  // Evolution-network integrity: every quantity must be reachable
  // from Mass and every quantity must have at least one onward route.
  // This prevents the game from silently ending at an energy/electrical node.
  // -------------------------------------------------------------
  {
    const adjacency = new Map<QuantityId, QuantityId[]>();
    for (const rule of PHYSICS_TRANSFORMATIONS) {
      const list = adjacency.get(rule.inputQuantity) || [];
      list.push(rule.outputQuantity);
      adjacency.set(rule.inputQuantity, list);
    }

    const reachable = new Set<QuantityId>(['m']);
    const queue: QuantityId[] = ['m'];
    while (queue.length) {
      const current = queue.shift()!;
      for (const next of adjacency.get(current) || []) {
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }

    const allQuantities = Object.keys(PHYSICAL_QUANTITIES) as QuantityId[];
    const unreachable = allQuantities.filter(q => !reachable.has(q));
    assert(
      'All physics quantities reachable from m',
      unreachable.length === 0,
      unreachable.length ? `Unreachable: ${unreachable.join(', ')}` : 'Every quantity has a path from Mass.'
    );

    const deadEnds = allQuantities.filter(q => (adjacency.get(q) || []).length === 0);
    assert(
      'No dead-end physics quantities',
      deadEnds.length === 0,
      deadEnds.length ? `Dead ends: ${deadEnds.join(', ')}` : 'Every quantity has at least one onward transformation.'
    );
  }

  // -------------------------------------------------------------
  // Validate every registered transformation through the evaluator.
  // -------------------------------------------------------------
  for (const rule of PHYSICS_TRANSFORMATIONS) {
    const pickup = GAME_PICKUPS.find(p => p.symbol === rule.operatorSymbol);
    if (!pickup) {
      assert(`Pickup exists: ${rule.id}`, false, `Missing pickup '${rule.operatorSymbol}'.`);
      continue;
    }

    const result = PhysicsEvaluator.evaluate(makeState(rule.inputQuantity), pickup);
    assert(
      `Transformation works: ${rule.id}`,
      result.valid && result.type === 'TRANSFORM' && result.newPrimary === rule.outputQuantity,
      result.message
    );
  }

  const allPassed = results.every(r => r.passed);
  return { allPassed, results };
}
