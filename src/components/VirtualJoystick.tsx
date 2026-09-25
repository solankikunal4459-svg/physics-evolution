import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const radius = 50; // max joystick distance

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance <= radius) {
      setKnobPos({ x: dx, y: dy });
      onMove({ x: dx / radius, y: dy / radius });
    } else {
      const angle = Math.atan2(dy, dx);
      const clampedX = Math.cos(angle) * radius;
      const clampedY = Math.sin(angle) * radius;
      setKnobPos({ x: clampedX, y: clampedY });
      onMove({ x: Math.cos(angle), y: Math.sin(angle) });
    }
  }, [onMove, radius]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current === null && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      setIsDragging(true);
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updatePosition(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  // Keyboard navigation fallback for desktop browser testing
  useEffect(() => {
    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysDown.add(key);
        evalKeyboard();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.delete(key);
      evalKeyboard();
    };

    const evalKeyboard = () => {
      let x = 0;
      let y = 0;
      if (keysDown.has('w') || keysDown.has('arrowup')) y -= 1;
      if (keysDown.has('s') || keysDown.has('arrowdown')) y += 1;
      if (keysDown.has('a') || keysDown.has('arrowleft')) x -= 1;
      if (keysDown.has('d') || keysDown.has('arrowright')) x += 1;

      const len = Math.hypot(x, y);
      if (len > 0) {
        onMove({ x: x / len, y: y / len });
        setKnobPos({ x: (x / len) * (radius * 0.7), y: (y / len) * (radius * 0.7) });
      } else {
        onMove({ x: 0, y: 0 });
        setKnobPos({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, radius]);

  return (
    <div
      id="virtual-joystick-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-32 h-32 rounded-full bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xs flex items-center justify-center pointer-events-auto touch-none select-none shadow-lg shadow-cyan-950/40"
    >
      {/* Inner guide ring */}
      <div className="absolute w-16 h-16 rounded-full border border-slate-700/50 pointer-events-none" />

      {/* Axis guidelines */}
      <div className="absolute w-full h-[1px] bg-slate-700/30 pointer-events-none" />
      <div className="absolute h-full w-[1px] bg-slate-700/30 pointer-events-none" />

      {/* Movable thumb knob */}
      <div
        id="virtual-joystick-knob"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className={`w-14 h-14 rounded-full border flex items-center justify-center pointer-events-none transition-colors ${
          isDragging
            ? 'bg-cyan-500/40 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
            : 'bg-slate-800/80 border-cyan-500/50'
        }`}
      >
        <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-sm" />
      </div>
    </div>
  );
};
