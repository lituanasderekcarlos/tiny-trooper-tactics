import { GameState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, WORLD_HEIGHT } from './constants';

function drawStickFigure(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  facing: number, color: string, outline: string,
  aimAngle?: number
) {
  const cx = x + w / 2;
  const headY = y + 8;
  const bodyTop = y + 16;
  const bodyBottom = y + h - 12;
  const hipY = bodyBottom;

  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Legs
  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(cx - 6, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(cx + 6, y + h);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(cx, bodyTop);
  ctx.lineTo(cx, hipY);
  ctx.stroke();

  // Arms / gun
  if (aimAngle !== undefined) {
    const armLen = 16;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, bodyTop + 4);
    ctx.lineTo(cx + Math.cos(aimAngle) * armLen, bodyTop + 4 + Math.sin(aimAngle) * armLen);
    ctx.stroke();
    // Gun
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(aimAngle) * armLen, bodyTop + 4 + Math.sin(aimAngle) * armLen);
    ctx.lineTo(cx + Math.cos(aimAngle) * (armLen + 10), bodyTop + 4 + Math.sin(aimAngle) * (armLen + 10));
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 10, bodyTop + 8);
    ctx.lineTo(cx, bodyTop + 4);
    ctx.lineTo(cx + 10, bodyTop + 8);
    ctx.stroke();
  }

  // Now draw colored overlay
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(cx - 6, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(cx + 6, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, bodyTop);
  ctx.lineTo(cx, hipY);
  ctx.stroke();

  // Head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, headY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx + facing * 3, headY - 1, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx + facing * 3.5, headY - 1, 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackground(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#0a150a');
  grad.addColorStop(0.5, '#142414');
  grad.addColorStop(1, '#1a2a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stars
  ctx.fillStyle = 'rgba(255,255,200,0.4)';
  for (let i = 0; i < 50; i++) {
    const sx = ((i * 137 + 50) % 1400) - (camX * 0.05) % 1400;
    const sy = ((i * 97 + 30) % 400);
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Distant mountains
  ctx.fillStyle = '#0f1f0f';
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  for (let x = 0; x <= CANVAS_WIDTH; x += 60) {
    const h = 100 + Math.sin((x + camX * 0.1) * 0.01) * 60 + Math.sin((x + camX * 0.1) * 0.025) * 30;
    ctx.lineTo(x, CANVAS_HEIGHT - h - (WORLD_HEIGHT - CANVAS_HEIGHT - camY) * 0.1);
  }
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fill();
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const { camera } = state;

  drawBackground(ctx, camera.x, camera.y);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // Platforms
  for (const p of state.platforms) {
    ctx.fillStyle = COLORS.platform;
    ctx.fillRect(p.x, p.y, p.width, p.height);
    // Top highlight
    ctx.fillStyle = COLORS.platformTop;
    ctx.fillRect(p.x, p.y, p.width, 3);
  }

  // Pickups
  for (const p of state.pickups) {
    if (p.collected) continue;
    const color = p.type === 'health' ? COLORS.pickup_health : COLORS.pickup_ammo;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.type === 'health' ? '+HP' : '+AM', p.pos.x, p.pos.y - 12);
  }

  // Enemies
  for (const e of state.enemies) {
    drawStickFigure(ctx, e.pos.x, e.pos.y, e.width, e.height, e.facing, COLORS.enemy, COLORS.enemyOutline);
    // Health bar
    const hpW = 30;
    ctx.fillStyle = COLORS.healthBg;
    ctx.fillRect(e.pos.x + e.width / 2 - hpW / 2, e.pos.y - 10, hpW, 4);
    ctx.fillStyle = COLORS.health;
    ctx.fillRect(e.pos.x + e.width / 2 - hpW / 2, e.pos.y - 10, hpW * (e.health / e.maxHealth), 4);
  }

  // Player
  if (!state.gameOver) {
    const { player } = state;
    drawStickFigure(
      ctx, player.pos.x, player.pos.y, player.width, player.height,
      player.facing, COLORS.player, COLORS.playerOutline, player.aimAngle
    );
  }

  // Bullets
  for (const b of state.bullets) {
    ctx.fillStyle = b.fromPlayer ? COLORS.bullet : COLORS.enemyBullet;
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, 3, 0, Math.PI * 2);
    ctx.fill();
    // Trail
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(b.pos.x - b.vel.x * 0.5, b.pos.y - b.vel.y * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Particles
  for (const p of state.particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.pos.x - p.size / 2, p.pos.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}
