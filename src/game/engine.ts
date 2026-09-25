import {
  PlayerEntity,
  ProjectileEntity,
  EnemyEntity,
  PickupEntity,
  ParticleEntity,
  FloatingNotification,
  GameMetrics,
  TransformationRecordEntry,
  ControlState,
  EnemyType,
} from './types';
import { PlayerPhysicsState, EvaluationResult, PhysicsEvaluator, PickupData } from '../physics/evaluator';
import { PHYSICAL_QUANTITIES } from '../physics/quantities';
import { QUANTITY_COMBAT_CONFIG } from './abilities';
import { GAME_PICKUPS } from '../physics/pickups';
import { soundManager } from './audio';
import { haptics } from './haptics';
import { codexStore } from '../physics/codex';

export interface GameEngineCallbacks {
  onStateChange: (state: PlayerPhysicsState) => void;
  onMetricsChange: (metrics: GameMetrics) => void;
  onHealthChange: (health: number, maxHealth: number) => void;
  onEvaluation: (result: EvaluationResult) => void;
  onGameOver: (metrics: GameMetrics, transformationHistory: TransformationRecordEntry[]) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Running state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number = 0;
  private lastTime: number = 0;

  // Entities
  private player: PlayerEntity;
  private projectiles: ProjectileEntity[] = [];
  private enemies: EnemyEntity[] = [];
  private pickups: PickupEntity[] = [];
  private particles: ParticleEntity[] = [];
  private notifications: FloatingNotification[] = [];
  private transformationHistory: TransformationRecordEntry[] = [];
  private touchControlActive = false;
  private touchTarget = { x: 0, y: 0 };

  // Timers & Spawners
  private enemySpawnTimer: number = 0;
  private pickupSpawnTimer: number = 0;
  private screenShake: number = 0;

  // Controls & Metrics
  private controls: ControlState = {
    joystickActive: false,
    moveVector: { x: 0, y: 0 },
    autoShoot: true,
  };

  private metrics: GameMetrics = {
    score: 0,
    wave: 1,
    enemiesDefeated: 0,
    transformationsCount: 0,
    invalidCombinationsCount: 0,
    timeAlive: 0,
  };

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = context;
    this.callbacks = callbacks;

    // Initialize player in starting MASS state
    this.player = this.createInitialPlayer();
  }

  private createInitialPlayer(): PlayerEntity {
    return {
      x: 120,
      y: (this.canvas.height >= this.canvas.width ? this.canvas.height * 0.72 : this.canvas.height / 2) || 200,
      vx: 0,
      vy: 0,
      radius: 22,
      health: 100,
      maxHealth: 100,
      physicsState: {
        primaryQuantity: 'm', // Player starts every game as Mass
        currentValue: 5,      // 5 kg
        mass: 5,              // 5 kg
        velocity: 15,         // 15 m/s
        momentum: 75,         // 75 kg·m/s
        buffer: [],
      },
      invulnerableTimer: 0,
      lastFireTime: 0,
      orbitAngle: 0,
    };
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    // Seed the opening seconds so the portrait game feels alive immediately.
    this.seedInitialEncounter();
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    this.callbacks.onStateChange(this.player.physicsState);
    this.callbacks.onHealthChange(this.player.health, this.player.maxHealth);
    this.callbacks.onMetricsChange(this.metrics);
  }

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  restart() {
    this.player = this.createInitialPlayer();
    this.projectiles = [];
    this.enemies = [];
    this.pickups = [];
    this.particles = [];
    this.notifications = [];
    this.transformationHistory = [];
    this.touchControlActive = false;
    this.enemySpawnTimer = 0;
    this.pickupSpawnTimer = 1.0;
    this.screenShake = 0;
    this.metrics = {
      score: 0,
      wave: 1,
      enemiesDefeated: 0,
      transformationsCount: 0,
      invalidCombinationsCount: 0,
      timeAlive: 0,
    };
    this.callbacks.onStateChange(this.player.physicsState);
    this.callbacks.onHealthChange(this.player.health, this.player.maxHealth);
    this.callbacks.onMetricsChange(this.metrics);
    this.isPaused = false;
    this.isRunning = true;
    this.seedInitialEncounter();
  }

  setControlVector(x: number, y: number) {
    this.controls.moveVector = { x, y };
  }

  setAutoShoot(auto: boolean) {
    this.controls.autoShoot = auto;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    if (this.player) {
      this.player.x = Math.min(Math.max(this.player.radius + 8, this.player.x), width - this.player.radius - 8);
      this.player.y = Math.min(Math.max(this.player.radius + 54, this.player.y), height - this.player.radius - 18);
    }
  }

  // --- GAME LOOP ---
  private loop(currentTime: number) {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(dt);
    }

    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  // --- UPDATE SIMULATION ---
  private update(dt: number) {
    this.metrics.timeAlive += dt;
    this.metrics.wave = 1 + Math.floor(this.metrics.timeAlive / 30);

    const combatConfig = QUANTITY_COMBAT_CONFIG[this.player.physicsState.primaryQuantity];

    // Update screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // 1. Player movement — portrait-first touch control.
    const currentSpeed = combatConfig.playerSpeed;
    const isPortrait = this.canvas.height >= this.canvas.width;

    if (this.touchControlActive) {
      // The particle follows the thumb, but its rendered position is kept a
      // comfortable distance away from the finger so the player can always
      // see the current symbol. Clamp the target before moving toward it so
      // the particle can never be pushed outside the visible playfield.
      const forwardX = isPortrait ? 0 : 48;
      const forwardY = isPortrait ? -64 : 0;
      const targetX = Math.max(this.player.radius + 8, Math.min(this.canvas.width - this.player.radius - 8, this.touchTarget.x + forwardX));
      const targetY = Math.max(this.player.radius + 54, Math.min(this.canvas.height - this.player.radius - 18, this.touchTarget.y + forwardY));
      const dx = targetX - this.player.x;
      const dy = targetY - this.player.y;
      const dist = Math.hypot(dx, dy);
      const maxStep = currentSpeed * 1.8 * dt;
      if (dist > 1) {
        const step = Math.min(dist, maxStep);
        this.player.x += (dx / dist) * step;
        this.player.y += (dy / dist) * step;
      }
    } else {
      this.player.x += this.controls.moveVector.x * currentSpeed * dt;
      this.player.y += this.controls.moveVector.y * currentSpeed * dt;
    }

    // Full-screen portrait battlefield; no landscape-only left-half restriction.
    const minX = this.player.radius + 8;
    const maxX = this.canvas.width - this.player.radius - 8;
    const minY = this.player.radius + 54;
    const maxY = this.canvas.height - this.player.radius - 18;

    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
    this.player.y = Math.max(minY, Math.min(maxY, this.player.y));

    this.player.orbitAngle += dt * 3.5;

    // Player invulnerability
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }

    // 2. Automatic shooting
    this.player.lastFireTime += dt;
    if (this.controls.autoShoot && this.player.lastFireTime >= combatConfig.fireInterval) {
      this.fireProjectiles(combatConfig);
      this.player.lastFireTime = 0;
    }

    // 3. Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Projectile particle trail
      if (Math.random() < 0.4) {
        this.particles.push({
          x: p.x - p.vx * 0.015,
          y: p.y - p.vy * 0.015,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          radius: p.radius * 0.5,
          color: p.color,
          alpha: 0.6,
          decay: 2.5,
        });
      }

      // Remove if off-screen
      if (p.x > this.canvas.width + 50 || p.y < -50 || p.y > this.canvas.height + 50) {
        this.projectiles.splice(i, 1);
      }
    }

    // 4. Spawn Enemies
    this.enemySpawnTimer += dt;
    const spawnInterval = Math.max(0.42, 1.15 - this.metrics.wave * 0.055);
    if (this.enemySpawnTimer >= spawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 5. Spawn Pickups (Strategic educational spawning)
    this.pickupSpawnTimer += dt;
    const pickupInterval = 1.8;
    if (this.pickupSpawnTimer >= pickupInterval) {
      this.spawnStrategicPickup();
      this.pickupSpawnTimer = 0;
    }

    // 6. Update Enemies & check projectile collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.pulse += dt * 4;

      // Check collision with projectiles
      for (let j = this.projectiles.length - 1; j >= 0; j--) {
        const proj = this.projectiles[j];
        if (proj.piercing && proj.piercedEnemyIds.has(enemy.id)) {
          continue;
        }

        const distSq = (proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2;
        const hitDist = proj.radius + enemy.radius;

        if (distSq <= hitDist * hitDist) {
          // Hit enemy!
          enemy.health -= proj.damage;
          enemy.x += combatConfig.knockback * 0.2; // slight knockback

          // Particle burst
          this.createHitSparks(proj.x, proj.y, proj.color, 5);

          if (!proj.piercing) {
            this.projectiles.splice(j, 1);
          } else {
            proj.piercedEnemyIds.add(enemy.id);
          }

          // Enemy killed
          if (enemy.health <= 0) {
            this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.radius);
            soundManager.playExplosion();
            this.metrics.score += enemy.scoreValue;
            this.metrics.enemiesDefeated += 1;
            this.callbacks.onMetricsChange(this.metrics);

            // Chance to drop a pickup on defeat (25%)
            if (Math.random() < 0.25) {
              this.dropPickupAt(enemy.x, enemy.y);
            }

            this.enemies.splice(i, 1);
            break;
          }
        }
      }

      // Check collision with player
      if (this.enemies[i]) {
        const pDistSq = (this.player.x - enemy.x) ** 2 + (this.player.y - enemy.y) ** 2;
        const pRadius = this.player.radius + enemy.radius;

        if (pDistSq <= pRadius * pRadius && this.player.invulnerableTimer <= 0) {
          // Player hurt
          this.player.health = Math.max(0, this.player.health - 20);
          this.player.invulnerableTimer = 1.0;
          this.screenShake = 12;
          soundManager.playHurt();
          haptics.damage();
          this.callbacks.onHealthChange(this.player.health, this.player.maxHealth);

          if (this.player.health <= 0) {
            this.callbacks.onGameOver(this.metrics, [...this.transformationHistory]);
            this.pause();
            return;
          }
        }

        // Remove enemies that move past left screen edge
        const outOfBounds = this.canvas.height >= this.canvas.width ? enemy.y > this.canvas.height + 60 : enemy.x < -60;
        if (outOfBounds) this.enemies.splice(i, 1);
      }
    }

    // 7. Update Pickups & player collection
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      pickup.x += pickup.vx * dt;
      pickup.y += pickup.vy * dt;
      pickup.pulsePhase += dt * 3;
      pickup.lifespan -= dt;

      // Pickups move naturally; they are NOT magnetically attracted to the player.
      const dx = this.player.x - pickup.x;
      const dy = this.player.y - pickup.y;
      const dist = Math.hypot(dx, dy);

      // Collision with player
      if (dist < this.player.radius + pickup.radius) {
        this.handlePickupCollection(pickup.data);
        this.pickups.splice(i, 1);
        continue;
      }

      // Remove expired or off-screen pickups
      const pickupOut = this.canvas.height >= this.canvas.width ? pickup.y > this.canvas.height + 50 : pickup.x < -50;
      if (pickup.lifespan <= 0 || pickupOut) {
        this.pickups.splice(i, 1);
      }
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha -= pt.decay * dt;
      if (pt.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 9. Update Notifications
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.y += n.vy * dt;
      n.alpha -= dt * 0.8;
      if (n.alpha <= 0) {
        this.notifications.splice(i, 1);
      }
    }
  }

  // --- SHOOTING LOGIC ---
  private fireProjectiles(config: typeof QUANTITY_COMBAT_CONFIG['m']) {
    const qType = this.player.physicsState.primaryQuantity;
    soundManager.playShoot(qType);

    const baseAngle = this.canvas.height >= this.canvas.width ? -Math.PI / 2 : 0;
    const halfSpread = (config.streams - 1) * config.spreadAngle * 0.5;

    for (let i = 0; i < config.streams; i++) {
      const angle = baseAngle - halfSpread + i * config.spreadAngle;
      const vx = Math.cos(angle) * config.projectileSpeed;
      const vy = Math.sin(angle) * config.projectileSpeed;

      this.projectiles.push({
        id: `proj_${Date.now()}_${Math.random()}`,
        x: this.player.x + (this.canvas.height >= this.canvas.width ? 0 : 20),
        y: this.player.y + (this.canvas.height >= this.canvas.width ? -20 : (i - (config.streams - 1) / 2) * 8),
        vx,
        vy,
        radius: config.projectileRadius,
        damage: config.projectileDamage,
        color: config.color,
        piercing: config.piercing,
        piercedEnemyIds: new Set(),
        shape: config.shape,
      });
    }

    // Fire recoil particle
    this.particles.push({
      x: this.player.x - 12,
      y: this.player.y,
      vx: -70 - Math.random() * 40,
      vy: (Math.random() - 0.5) * 40,
      radius: 4,
      color: config.color,
      alpha: 0.8,
      decay: 3.5,
    });
  }

  // --- PICKUP COLLECTION & EVALUATION ---
  private handlePickupCollection(pickup: PickupData) {
    const evalResult = PhysicsEvaluator.evaluate(this.player.physicsState, pickup);

    if (evalResult.valid) {
      if (evalResult.type === 'TRANSFORM' && evalResult.newPrimary) {
        // Transformation!
        this.player.physicsState.primaryQuantity = evalResult.newPrimary;
        if (evalResult.updatedState) {
          Object.assign(this.player.physicsState, evalResult.updatedState);
        }

        // Record discovery in Codex
        codexStore.unlockQuantity(evalResult.newPrimary);
        if (evalResult.transformationRule) {
          codexStore.unlockTransformation(evalResult.transformationRule.id);
        }

        // Audio, haptics and feedback
        soundManager.playTransformation();
        haptics.transform();
        this.screenShake = 8;
        this.metrics.transformationsCount += 1;
        this.metrics.score += 250;
        this.transformationHistory.push({
          from: this.getQuantitySymbol(pickup, evalResult.transformationRule?.inputQuantity || this.player.physicsState.primaryQuantity),
          to: PHYSICAL_QUANTITIES[evalResult.newPrimary].symbol,
          formula: evalResult.transformationRule?.formula || evalResult.formula || '',
          title: evalResult.transformationRule?.name || evalResult.title,
          timestamp: Date.now(),
        });

        // Big visual transformation shockwave
        this.createTransformationShockwave(this.player.x, this.player.y, pickup.color);

        this.addNotification(this.player.x, this.player.y - 35, evalResult.title, '#34d399', 18);
      } else if (evalResult.type === 'BUFFER') {
        if (evalResult.updatedState) {
          Object.assign(this.player.physicsState, evalResult.updatedState);
        }
        soundManager.playPickup(true);
        haptics.medium();
        this.addNotification(this.player.x, this.player.y - 30, evalResult.title, '#8b5cf6', 15);
      } else if (evalResult.type === 'MODIFY') {
        // Magnitude modification (+m, -m, etc.)
        if (evalResult.updatedState) {
          Object.assign(this.player.physicsState, evalResult.updatedState);
        }
        soundManager.playPickup(true);
        haptics.light();
        this.metrics.score += 50;

        this.addNotification(
          this.player.x,
          this.player.y - 30,
          `${pickup.symbol} (${evalResult.title})`,
          pickup.color,
          15
        );
      }

      this.callbacks.onStateChange({ ...this.player.physicsState });
      this.callbacks.onMetricsChange(this.metrics);
      this.callbacks.onEvaluation(evalResult);
    } else {
      // Invalid combination!
      soundManager.playInvalidBuzz();
      haptics.invalid();
      this.metrics.invalidCombinationsCount += 1;
      this.callbacks.onMetricsChange(this.metrics);
      this.callbacks.onEvaluation(evalResult);

      this.addNotification(
        this.player.x,
        this.player.y - 30,
        `INVALID: ${evalResult.dimensionsA} ≠ ${evalResult.dimensionsB}`,
        '#ef4444',
        14
      );

      // Red fizzle particles
      this.createHitSparks(this.player.x, this.player.y, '#ef4444', 12);
    }
  }

  private getQuantitySymbol(_pickup: PickupData, quantityId: string) {
    return PHYSICAL_QUANTITIES[quantityId as keyof typeof PHYSICAL_QUANTITIES]?.symbol || quantityId;
  }

  getTransformationHistory(): TransformationRecordEntry[] {
    return [...this.transformationHistory];
  }

  beginTouchControl(x: number, y: number): boolean {
    const dist = Math.hypot(this.player.x - x, this.player.y - y);
    if (dist > this.player.radius * 2.2) return false;
    this.touchControlActive = true;
    this.touchTarget = { x, y };
    return true;
  }

  updateTouchControl(x: number, y: number) {
    if (!this.touchControlActive) return;
    this.touchTarget = {
      x: Math.max(0, Math.min(this.canvas.width, x)),
      y: Math.max(0, Math.min(this.canvas.height, y)),
    };
  }

  endTouchControl() {
    this.touchControlActive = false;
  }

  private seedInitialEncounter() {
    // Make the opening seconds lively, especially on small portrait screens.
    const enemyCount = this.canvas.height >= this.canvas.width ? 6 : 4;
    for (let i = 0; i < enemyCount; i++) this.spawnEnemy();

    const openingSymbols = ['×v', '+m', 'd/dt'];
    for (let i = 0; i < openingSymbols.length; i++) {
      const data = GAME_PICKUPS.find(p => p.symbol === openingSymbols[i]);
      if (!data) continue;
      const portrait = this.canvas.height >= this.canvas.width;
      this.pickups.push({
        id: `opening_pickup_${Date.now()}_${i}_${Math.random()}`,
        data,
        x: portrait ? 25 + Math.random() * (this.canvas.width - 50) : this.canvas.width + 20 + i * 50,
        y: portrait ? 110 + Math.random() * Math.max(60, this.canvas.height * 0.25) : 50 + Math.random() * (this.canvas.height - 100),
        vx: portrait ? (Math.random() - 0.5) * 12 : -90,
        vy: portrait ? 35 + Math.random() * 20 : (Math.random() - 0.5) * 15,
        radius: 18,
        pulsePhase: Math.random() * Math.PI * 2,
        lifespan: 22,
      });
    }
  }

  // --- SPAWNING HELPERS ---
  private spawnEnemy() {
    const types: EnemyType[] = ['scrapper', 'inertial', 'brute'];
    // Weight enemy types by wave
    let chosenType: EnemyType = 'scrapper';
    const rand = Math.random();

    if (this.metrics.wave >= 3 && rand < 0.25) {
      chosenType = 'brute';
    } else if (this.metrics.wave >= 2 && rand < 0.5) {
      chosenType = 'inertial';
    }

    const portrait = this.canvas.height >= this.canvas.width;
    const spawnX = portrait ? 30 + Math.random() * Math.max(1, this.canvas.width - 60) : this.canvas.width + 40;
    const spawnY = portrait ? -40 : 40 + Math.random() * Math.max(1, this.canvas.height - 80);

    let speed = 90 + Math.random() * 40 + this.metrics.wave * 8;
    let health = 40 + this.metrics.wave * 8;
    let radius = 16;
    let color = '#f87171';
    let name = 'Kinetic Scrapper';
    let score = 50;

    if (chosenType === 'inertial') {
      speed = 160 + Math.random() * 50;
      health = 30 + this.metrics.wave * 5;
      radius = 13;
      color = '#c084fc';
      name = 'Inertial Drone';
      score = 75;
    } else if (chosenType === 'brute') {
      speed = 60 + Math.random() * 20;
      health = 130 + this.metrics.wave * 25;
      radius = 24;
      color = '#fb923c';
      name = 'Heavy Matter Brute';
      score = 150;
    }

    this.enemies.push({
      id: `enemy_${Date.now()}_${Math.random()}`,
      type: chosenType,
      name,
      x: spawnX,
      y: spawnY,
      vx: portrait ? (Math.random() - 0.5) * 35 : -speed,
      vy: portrait ? speed : (Math.random() - 0.5) * 30,
      radius,
      health,
      maxHealth: health,
      speed,
      scoreValue: score,
      color,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  private spawnStrategicPickup() {
    // Current player state and recipe buffer determine intelligent spawn balancing
    const currentQ = this.player.physicsState.primaryQuantity;
    const buffer = this.player.physicsState.buffer || [];
    let selectedPickup: PickupData | undefined;

    // 1. If multi-step recipe is buffered (e.g. ['g']), prioritize complementary piece ('×h')
    if (buffer.includes('g') && Math.random() < 0.75) {
      selectedPickup = GAME_PICKUPS.find(p => p.symbol === '×h');
    }

    if (!selectedPickup) {
      // 2. Query the evolution frontier departing from the current state.
      // Prefer transformations that reveal a new quantity/law. If everything
      // is already discovered, fall back to the full outgoing graph so the
      // player can continue evolving indefinitely through valid cycles.
      const availableTransforms = codexStore.getDiscoveryFrontier(currentQ);
      const r = Math.random();

      if (availableTransforms.length > 0 && r < 0.78) {
        const chosenRule = availableTransforms[Math.floor(Math.random() * availableTransforms.length)];
        const match = GAME_PICKUPS.find(p => p.symbol === chosenRule.operatorSymbol);
        selectedPickup = match || GAME_PICKUPS[0];
      } else if (r < 0.9) {
        // Spawn magnitude modifier for current quantity if available
        const currentQInfo = PHYSICAL_QUANTITIES[currentQ];
        const modifierMatch = GAME_PICKUPS.find(p => 
          p.category === 'MODIFIER' && 
          p.operandDimension.equals(currentQInfo.dimensions)
        );
        selectedPickup = modifierMatch || GAME_PICKUPS[0];
      } else {
        // Distractor to challenge and teach dimensional reasoning
        const distractors = GAME_PICKUPS.filter(p => 
          !p.operandDimension.equals(PHYSICAL_QUANTITIES[currentQ].dimensions)
        );
        selectedPickup = distractors[Math.floor(Math.random() * distractors.length)] || GAME_PICKUPS[0];
      }
    }

    const portrait = this.canvas.height >= this.canvas.width;
    const y = portrait ? -25 : 50 + Math.random() * Math.max(1, this.canvas.height - 100);

    this.pickups.push({
      id: `pickup_${Date.now()}_${Math.random()}`,
      data: selectedPickup,
      x: portrait ? 25 + Math.random() * Math.max(1, this.canvas.width - 50) : this.canvas.width + 30,
      y,
      vx: portrait ? (Math.random() - 0.5) * 15 : -70 - Math.random() * 20,
      vy: portrait ? 45 + Math.random() * 25 : (Math.random() - 0.5) * 15,
      radius: 18,
      pulsePhase: Math.random() * Math.PI * 2,
      lifespan: 16,
    });
  }

  private dropPickupAt(x: number, y: number) {
    const common = GAME_PICKUPS.filter(p => p.rarity === 'common');
    const picked = common[Math.floor(Math.random() * common.length)];

    this.pickups.push({
      id: `pickup_drop_${Date.now()}`,
      data: picked,
      x,
      y,
      vx: -40,
      vy: (Math.random() - 0.5) * 20,
      radius: 18,
      pulsePhase: 0,
      lifespan: 14,
    });
  }

  // --- FX & PARTICLES ---
  private createHitSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 3 + Math.random() * 2,
      });
    }
  }

  private createExplosion(x: number, y: number, color: string, radius: number) {
    const count = Math.floor(radius * 0.8) + 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 1.8 + Math.random() * 1.5,
      });
    }
  }

  private createTransformationShockwave(x: number, y: number, color: string) {
    const ringCount = 36;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const speed = 140 + Math.random() * 50;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4,
        color,
        alpha: 1,
        decay: 1.4,
      });
    }
  }

  private addNotification(x: number, y: number, text: string, color: string, size: number = 14) {
    this.notifications.push({
      id: `notif_${Date.now()}_${Math.random()}`,
      x,
      y,
      vy: -25,
      text,
      color,
      alpha: 1,
      size,
    });
  }

  // --- RENDERING ---
  private render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Apply screen shake
    ctx.save();
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Dark space sci-fi background with speed grid
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    this.renderBackgroundGrid(ctx, width, height);

    // 2. Render Particles
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Render Pickups
    this.renderPickups(ctx);

    // 4. Render Projectiles
    this.renderProjectiles(ctx);

    // 5. Render Enemies
    this.renderEnemies(ctx);

    // 6. Render Player
    this.renderPlayer(ctx);

    // 7. Render Floating Notifications
    for (const n of this.notifications) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, n.alpha);
      ctx.font = `bold ${n.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = n.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 8;
      ctx.fillText(n.text, n.x, n.y);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderBackgroundGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;

    const gridSize = 60;
    const offset = (this.metrics.timeAlive * 35) % gridSize;

    // Vertical moving grid lines
    for (let x = -offset; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Subtle star dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 25; i++) {
      const starX = ((i * 73 + offset * 0.4) % width);
      const starY = (i * 37) % height;
      ctx.fillRect(starX, starY, 1.5, 1.5);
    }

    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const qType = p.physicsState.primaryQuantity;
    const qInfo = PHYSICAL_QUANTITIES[qType];

    ctx.save();
    ctx.translate(p.x, p.y);

    // Flicker if invulnerable
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Outer aura glow
    const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, p.radius * 2);
    grad.addColorStop(0, qInfo.theme.glow);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Visual design specific to physical quantity
    if (qType === 'm') {
      // MASS (m): Heavy solid planetary mass core with orbiting gravitational rings
      // Gravitational ring 1
      ctx.save();
      ctx.rotate(p.orbitAngle);
      ctx.strokeStyle = qInfo.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius + 6, (p.radius + 6) * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting mass moon
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(p.radius + 6, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Solid heavy core
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (qType === 'p') {
      // MOMENTUM (p): Dual energy vector rings and thrust vector wings
      ctx.save();
      ctx.rotate(p.orbitAngle * 1.5);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 5, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      // Core polygon / hexagon
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const hx = Math.cos(ang) * p.radius;
        const hy = Math.sin(ang) * p.radius;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (qType === 'v') {
      // VELOCITY (v): Aerodynamic sleek forward chevron
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(p.radius * 1.3, 0);
      ctx.lineTo(-p.radius, -p.radius * 0.9);
      ctx.lineTo(-p.radius * 0.4, 0);
      ctx.lineTo(-p.radius, p.radius * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Generic fallback
      ctx.fillStyle = qInfo.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Physical Symbol centered in character
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(qInfo.symbol, 0, 0);

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const proj of this.projectiles) {
      ctx.save();
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = proj.color;

      if (proj.shape === 'heavy_orb') {
        // Heavy dense orb with glowing core
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(proj.x - 2, proj.y - 2, proj.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (proj.shape === 'piercing_needle') {
        // Long sleek needle
        ctx.lineWidth = 4;
        ctx.strokeStyle = proj.color;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(proj.x - 14, proj.y);
        ctx.lineTo(proj.x + 10, proj.y);
        ctx.stroke();
      } else if (proj.shape === 'explosive_blast') {
        // Expanding shock diamond
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (proj.shape === 'continuous_beam') {
        // High-energy laser pulse
        ctx.lineWidth = 5;
        ctx.strokeStyle = proj.color;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(proj.x - 18, proj.y);
        ctx.lineTo(proj.x + 12, proj.y);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (proj.shape === 'plasma_sphere' || proj.shape === 'graviton_pulse') {
        // Solar plasma core
        const grad = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, proj.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, proj.color);
        grad.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (proj.shape === 'spiral_blade' || proj.shape === 'boomerang_disk') {
        // Spinning cutting disk
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(performance.now() * 0.01);
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 1.6);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (proj.shape === 'lightning_arc') {
        // Jagged electrostatic spark
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(proj.x - 12, proj.y + (Math.random() - 0.5) * 6);
        ctx.lineTo(proj.x, proj.y + (Math.random() - 0.5) * 8);
        ctx.lineTo(proj.x + 10, proj.y);
        ctx.stroke();
      } else if (proj.shape === 'wavefront_ray') {
        // Broad planar wavefront
        ctx.lineWidth = 4;
        ctx.strokeStyle = proj.color;
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y - 14);
        ctx.lineTo(proj.x, proj.y + 14);
        ctx.stroke();
      } else {
        // Multi tracer stream / default
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const enemy of this.enemies) {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = enemy.color;

      if (enemy.type === 'scrapper') {
        // Triangle scout pointing left
        ctx.beginPath();
        ctx.moveTo(-enemy.radius, 0);
        ctx.lineTo(enemy.radius, -enemy.radius * 0.8);
        ctx.lineTo(enemy.radius * 0.5, 0);
        ctx.lineTo(enemy.radius, enemy.radius * 0.8);
        ctx.closePath();
        ctx.fill();
      } else if (enemy.type === 'inertial') {
        // Spinning Diamond
        ctx.rotate(enemy.pulse);
        ctx.beginPath();
        ctx.moveTo(0, -enemy.radius);
        ctx.lineTo(enemy.radius, 0);
        ctx.lineTo(0, enemy.radius);
        ctx.lineTo(-enemy.radius, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Heavy Hexagon Brute
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const hx = Math.cos(ang) * enemy.radius;
          const hy = Math.sin(ang) * enemy.radius;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Health bar
      if (enemy.health < enemy.maxHealth) {
        const barW = enemy.radius * 2;
        const barH = 4;
        const barY = -enemy.radius - 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, barY, barW, barH);
        const healthPercent = Math.max(0, enemy.health / enemy.maxHealth);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-barW / 2, barY, barW * healthPercent, barH);
      }

      ctx.restore();
    }
  }

  private renderPickups(ctx: CanvasRenderingContext2D) {
    for (const pickup of this.pickups) {
      ctx.save();
      ctx.translate(pickup.x, pickup.y);

      const pulse = 1 + Math.sin(pickup.pulsePhase) * 0.12;
      ctx.scale(pulse, pulse);

      // Glowing hex badge
      ctx.shadowColor = pickup.data.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = pickup.data.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const px = Math.cos(ang) * pickup.radius;
        const py = Math.sin(ang) * pickup.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Symbol
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pickup.data.symbol, 0, 0);

      ctx.restore();
    }
  }

  getPlayerState(): PlayerPhysicsState {
    return this.player.physicsState;
  }
}
