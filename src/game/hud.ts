import { GameState } from './types';
import { CANVAS_WIDTH, COLORS } from './constants';

export function renderHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player } = state;
  const pad = 15;
  const barW = 150;
  const barH = 12;

  // Health
  ctx.fillStyle = COLORS.healthBg;
  ctx.fillRect(pad, pad, barW, barH);
  ctx.fillStyle = COLORS.health;
  ctx.fillRect(pad, pad, barW * (player.health / player.maxHealth), barH);
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, pad, barW, barH);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Rajdhani, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`HP ${Math.ceil(player.health)}`, pad + 4, pad + 10);

  // Fuel
  ctx.fillStyle = COLORS.fuelBg;
  ctx.fillRect(pad, pad + barH + 5, barW, barH);
  ctx.fillStyle = COLORS.fuel;
  ctx.fillRect(pad, pad + barH + 5, barW * (player.fuel / player.maxFuel), barH);
  ctx.strokeStyle = '#4a4a4a';
  ctx.strokeRect(pad, pad + barH + 5, barW, barH);
  ctx.fillStyle = '#fff';
  ctx.fillText(`FUEL ${Math.ceil(player.fuel)}`, pad + 4, pad + barH + 15);

  // Ammo
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Rajdhani, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🔫 ${player.ammo}/${player.maxAmmo}`, pad, pad + barH * 2 + 22);

  // Score & Wave
  ctx.textAlign = 'right';
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.fillStyle = '#e8d44d';
  ctx.fillText(`${player.score}`, CANVAS_WIDTH - pad, pad + 14);
  ctx.font = 'bold 12px Rajdhani, sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`WAVE ${state.wave}`, CANVAS_WIDTH - pad, pad + 30);
  ctx.fillText(`KILLS ${state.enemiesKilled}`, CANVAS_WIDTH - pad, pad + 44);

  // Crosshair indicator
  const mx = state.mousePos.x;
  const my = state.mousePos.y;
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(mx, my, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx - 12, my);
  ctx.lineTo(mx - 5, my);
  ctx.moveTo(mx + 5, my);
  ctx.lineTo(mx + 12, my);
  ctx.moveTo(mx, my - 12);
  ctx.lineTo(mx, my - 5);
  ctx.moveTo(mx, my + 5);
  ctx.lineTo(mx, my + 12);
  ctx.stroke();
}

export function renderOverlay(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 600);
    ctx.fillStyle = '#e04040';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 250);
    ctx.fillStyle = '#e8d44d';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${state.player.score}`, CANVAS_WIDTH / 2, 290);
    ctx.fillStyle = '#aaa';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('CLICK TO RESTART', CANVAS_WIDTH / 2, 340);
  }

  if (!state.started) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 600);
    ctx.fillStyle = '#e8d44d';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MINI MILITIA', CANVAS_WIDTH / 2, 180);
    ctx.fillStyle = '#4d8a4d';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('2D COMBAT', CANVAS_WIDTH / 2, 210);

    ctx.fillStyle = '#ccc';
    ctx.font = '14px Rajdhani, sans-serif';
    ctx.fillText('WASD / Arrows — Move & Jump', CANVAS_WIDTH / 2, 270);
    ctx.fillText('Hold Jump in air — Jetpack', CANVAS_WIDTH / 2, 295);
    ctx.fillText('Mouse — Aim & Shoot', CANVAS_WIDTH / 2, 320);

    ctx.fillStyle = '#e8d44d';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('CLICK TO START', CANVAS_WIDTH / 2, 380);
  }
}
