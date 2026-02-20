import { useRef, useEffect, useCallback } from 'react';
import { createInitialState, updateGame } from '@/game/engine';
import { renderGame } from '@/game/renderer';
import { renderHUD, renderOverlay } from '@/game/hud';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { GameState } from '@/game/types';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const animRef = useRef<number>(0);

  const handleKey = useCallback((e: KeyboardEvent, down: boolean) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      e.preventDefault();
      if (down) stateRef.current.keys.add(key);
      else stateRef.current.keys.delete(key);
    }
    if (key === 'escape' && down) {
      stateRef.current.paused = !stateRef.current.paused;
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    stateRef.current.mousePos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const state = stateRef.current;
    if (!state.started) {
      state.started = true;
      return;
    }
    if (state.gameOver) {
      stateRef.current = createInitialState();
      stateRef.current.started = true;
      return;
    }
    state.mouseDown = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.mouseDown = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const keyDown = (e: KeyboardEvent) => handleKey(e, true);
    const keyUp = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const loop = () => {
      updateGame(stateRef.current);
      renderGame(ctx, stateRef.current);
      renderHUD(ctx, stateRef.current);
      renderOverlay(ctx, stateRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKey, handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block max-w-full max-h-screen w-full border-2 border-border rounded-lg"
      style={{ imageRendering: 'pixelated', cursor: 'crosshair' }}
    />
  );
};

export default GameCanvas;
