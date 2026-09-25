import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { GameEngine } from './game/engine';
import { PlayerPhysicsState, EvaluationResult } from './physics/evaluator';
import { GameMetrics, TransformationRecordEntry } from './game/types';
import { soundManager } from './game/audio';
import { HUD } from './components/HUD';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { CodexModal } from './components/CodexModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { Maximize2, Minimize2, Crosshair } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI State
  const [physicsState, setPhysicsState] = useState<PlayerPhysicsState>({
    primaryQuantity: 'm',
    mass: 5,
    velocity: 15,
    momentum: 75,
  });
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [metrics, setMetrics] = useState<GameMetrics>({
    score: 0,
    wave: 1,
    enemiesDefeated: 0,
    transformationsCount: 0,
    invalidCombinationsCount: 0,
    timeAlive: 0,
  });

  const [feedbackResult, setFeedbackResult] = useState<EvaluationResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoShoot, setAutoShoot] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [transformationHistory, setTransformationHistory] = useState<TransformationRecordEntry[]>([]);
  const touchIdRef = useRef<number | null>(null);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const engine = new GameEngine(canvas, {
      onStateChange: (state) => setPhysicsState({ ...state }),
      onMetricsChange: (m) => setMetrics({ ...m }),
      onHealthChange: (h, mh) => {
        setHealth(h);
        setMaxHealth(mh);
      },
      onEvaluation: (result) => {
        setFeedbackResult(result);
        // Keep the pause-screen journey live so it can be viewed at any time.
        const history = engineRef.current?.getTransformationHistory();
        if (history) setTransformationHistory(history);
      },
      onGameOver: (_metrics, history) => {
        setTransformationHistory(history);
        setIsGameOver(true);
      },
    });

    engineRef.current = engine;
    engine.start();

    // Resize Handler
    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        const p = canvasRef.current.parentElement;
        const w = p ? p.clientWidth : window.innerWidth;
        const h = p ? p.clientHeight : window.innerHeight;
        engineRef.current.resize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Pause / Resume Handlers
  const handlePause = () => {
    setIsPaused(true);
    engineRef.current?.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    engineRef.current?.resume();
  };

  const handleRestart = () => {
    setIsPaused(false);
    setIsGameOver(false);
    setFeedbackResult(null);
    setTransformationHistory([]);
    engineRef.current?.restart();
  };

  // Particle-as-controller touch input. Touch the particle first;
  // after that, thumb movement directly determines the particle's position while keeping the particle visible above the thumb.
  const getCanvasPoint = (touch: Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleCanvasTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    if (touchIdRef.current !== null || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const point = getCanvasPoint(touch);
    if (!point) return;
    if (engineRef.current?.beginTouchControl(point.x, point.y)) {
      touchIdRef.current = touch.identifier;
      e.preventDefault();
    }
  };

  const handleCanvasTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (touchIdRef.current === null) return;
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === touchIdRef.current) {
        const point = getCanvasPoint(touch);
        if (point) engineRef.current?.updateTouchControl(point.x, point.y);
        e.preventDefault();
        break;
      }
    }
  };

  const handleCanvasTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
    if (touchIdRef.current === null) return;
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        engineRef.current?.endTouchControl();
        e.preventDefault();
        break;
      }
    }
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Auto-shoot Toggle
  const handleToggleAutoShoot = () => {
    const next = !autoShoot;
    setAutoShoot(next);
    engineRef.current?.setAutoShoot(next);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="app-root-container"
      className="relative w-screen h-screen overflow-hidden bg-[#080b12] text-slate-100 font-sans select-none touch-none flex flex-col items-center justify-center"
    >
      {/* Portrait-first game canvas. The canvas and every overlay are clipped to the viewport. */}
      <div className="relative w-full h-full">
        <canvas
          id="physics-game-canvas"
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair touch-none"
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          onTouchCancel={handleCanvasTouchEnd}
        />

        {/* Heads Up Display (HUD) */}
        <HUD
          physicsState={physicsState}
          health={health}
          maxHealth={maxHealth}
          metrics={metrics}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onPause={handlePause}
          onOpenCodex={() => setIsCodexOpen(true)}
          onRestart={handleRestart}
        />

        {/* Floating Physics Feedback Banner (Valid Transformations & Invalid Dimensional Mismatches) */}
        <FeedbackOverlay
          result={feedbackResult}
          onDismiss={() => setFeedbackResult(null)}
        />

        {/* Minimal mobile controls. The particle itself is the joystick: touch the particle,
            then drag your thumb to move it. Utility buttons stay inside the safe area. */}
        <div
          id="touch-controls-layer"
          className="absolute inset-x-0 bottom-0 max-w-full pointer-events-none p-2 sm:p-6 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-end z-10 overflow-hidden"
        >
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Auto-Fire Mode Button */}
            <button
              id="ctrl-btn-autofire"
              onClick={handleToggleAutoShoot}
              className={`p-3 rounded-2xl border backdrop-blur-md flex flex-col items-center gap-1 transition-all shadow-lg active:scale-95 ${
                autoShoot
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-cyan-950/50'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
            >
              <Crosshair className={`w-6 h-6 ${autoShoot ? 'animate-pulse' : ''}`} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                AUTO-FIRE: {autoShoot ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Fullscreen Mode Button */}
            <button
              id="ctrl-btn-fullscreen"
              onClick={handleToggleFullscreen}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-300 backdrop-blur-md hover:border-slate-500 transition-colors shadow-lg active:scale-95"
              title="Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Physics Codex Modal */}
      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
      />

      {/* Pause Menu Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        transformationHistory={transformationHistory}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOver}
        metrics={metrics}
        transformationHistory={transformationHistory}
        onRestart={handleRestart}
      />
    </div>
  );
}
