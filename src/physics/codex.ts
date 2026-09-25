import { QuantityId, PHYSICAL_QUANTITIES, PhysicalQuantityInfo, QuantityCategory } from './quantities';
import { TransformationRule, PHYSICS_TRANSFORMATIONS } from './transformations';

export interface CodexEntry {
  quantityId: QuantityId;
  info: PhysicalQuantityInfo;
  discovered: boolean;
  discoveredAt?: number;
}

export interface CodexTransformationEntry {
  rule: TransformationRule;
  discovered: boolean;
  discoveredAt?: number;
}

const STORAGE_KEY = 'physics_evolution_codex_state_v3';

export class CodexStore {
  private discoveredQuantities: Set<QuantityId> = new Set(['m']); // Player starts every game as Mass
  private discoveredTransformations: Set<string> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.quantities)) {
          this.discoveredQuantities = new Set(['m', ...parsed.quantities]);
        }
        if (Array.isArray(parsed.transformations)) {
          this.discoveredTransformations = new Set(parsed.transformations);
        }
      }
    } catch {
      // Fallback
    }
  }

  private save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          quantities: Array.from(this.discoveredQuantities),
          transformations: Array.from(this.discoveredTransformations),
        })
      );
    } catch {
      // Ignore
    }
  }

  unlockQuantity(id: QuantityId): boolean {
    if (!this.discoveredQuantities.has(id)) {
      this.discoveredQuantities.add(id);
      this.save();
      return true; // Newly unlocked
    }
    return false;
  }

  unlockTransformation(id: string): boolean {
    if (!this.discoveredTransformations.has(id)) {
      this.discoveredTransformations.add(id);
      this.save();
      return true; // Newly unlocked
    }
    return false;
  }

  isQuantityUnlocked(id: QuantityId): boolean {
    return this.discoveredQuantities.has(id);
  }

  isTransformationUnlocked(id: string): boolean {
    return this.discoveredTransformations.has(id);
  }

  getDiscoveredCount(): number {
    return this.discoveredQuantities.size;
  }

  getTotalQuantitiesCount(): number {
    return Object.keys(PHYSICAL_QUANTITIES).length;
  }

  getDiscoveredTransformationsCount(): number {
    return this.discoveredTransformations.size;
  }

  getTotalTransformationsCount(): number {
    return PHYSICS_TRANSFORMATIONS.length;
  }

  getDiscoveryStats() {
    const qDisc = this.getDiscoveredCount();
    const qTot = this.getTotalQuantitiesCount();
    const tDisc = this.getDiscoveredTransformationsCount();
    const tTot = this.getTotalTransformationsCount();
    const percentage = Math.round(((qDisc + tDisc) / (qTot + tTot)) * 100);
    return {
      quantitiesDiscovered: qDisc,
      quantitiesTotal: qTot,
      transformationsDiscovered: tDisc,
      transformationsTotal: tTot,
      percentage,
    };
  }

  getQuantitiesList(categoryFilter?: QuantityCategory | 'All'): CodexEntry[] {
    const allKeys = Object.keys(PHYSICAL_QUANTITIES) as QuantityId[];
    const list = allKeys.map(key => ({
      quantityId: key,
      info: PHYSICAL_QUANTITIES[key],
      discovered: this.discoveredQuantities.has(key),
    }));

    if (categoryFilter && categoryFilter !== 'All') {
      return list.filter(entry => entry.info.category === categoryFilter);
    }
    return list;
  }

  getTransformationsList(domainFilter?: QuantityCategory | 'All'): CodexTransformationEntry[] {
    const list = PHYSICS_TRANSFORMATIONS.map(rule => ({
      rule,
      discovered: this.discoveredTransformations.has(rule.id),
    }));

    if (domainFilter && domainFilter !== 'All') {
      return list.filter(entry => entry.rule.domain === domainFilter);
    }
    return list;
  }

  /**
   * Returns all valid transformation rules departing from the current quantity
   */
  getAvailableTransformationsFrom(current: QuantityId): TransformationRule[] {
    return PHYSICS_TRANSFORMATIONS.filter(rule => rule.inputQuantity === current);
  }

  /**
   * Returns the next transformation frontier. New output quantities are preferred
   * so gameplay continually introduces new physics instead of looping on known states.
   */
  getDiscoveryFrontier(current: QuantityId): TransformationRule[] {
    const outgoing = this.getAvailableTransformationsFrom(current);
    const undiscovered = outgoing.filter(rule =>
      !this.discoveredQuantities.has(rule.outputQuantity) ||
      !this.discoveredTransformations.has(rule.id)
    );
    return undiscovered.length ? undiscovered : outgoing;
  }

  /**
   * Returns true when the current quantity has at least one route onward.
   * Used by the game to prevent accidental dead-end states.
   */
  hasEvolutionRoute(current: QuantityId): boolean {
    return this.getAvailableTransformationsFrom(current).length > 0;
  }

  resetProgress() {
    this.discoveredQuantities = new Set(['m']);
    this.discoveredTransformations = new Set();
    this.save();
  }
}

export const codexStore = new CodexStore();
