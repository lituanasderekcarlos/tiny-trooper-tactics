import { GameState, Player, Enemy, Bullet, Platform, Particle, Pickup } from './types';
import {
  GRAVITY, PLAYER_SPEED, JUMP_FORCE, JETPACK_FORCE,
  FUEL_DRAIN, FUEL_REGEN, BULLET_SPEED, SHOOT_COOLDOWN,
  ENEMY_SPEED, ENEMY_SHOOT_COOLDOWN, WORLD_WIDTH, WORLD_HEIGHT,
  CANVAS_WIDTH, CANVAS_HEIGHT
} from './constants';

function createPlatforms(): Platform[] {
  return [
    // Ground
    { x: 0, y: WORLD_HEIGHT - 40, width: WORLD_WIDTH, height: 40 },
    // Platforms
    { x: 100, y: 950, width: 200, height: 20 },
    { x: 400, y: 850, width: 250, height: 20 },
    { x: 750, y: 780, width: 180, height: 20 },
    { x: 1000, y: 900, width: 220, height: 20 },
    { x: 1300, y: 800, width: 200, height: 20 },
    { x: 1600, y: 700, width: 250, height: 20 },
    { x: 1900, y: 850, width: 200, height: 20 },
    { x: 200, y: 650, width: 150, height: 20 },
    { x: 550, y: 550, width: 200, height: 20 },
    { x: 900, y: 600, width: 180, height: 20 },
    { x: 1200, y: 500, width: 220, height: 20 },
    { x: 1500, y: 550, width: 180, height: 20 },
    { x: 1800, y: 450, width: 200, height: 20 },
    { x: 300, y: 400, width: 180, height: 20 },
    { x: 700, y: 350, width: 200, height: 20 },
    { x: 1100, y: 300, width: 250, height: 20 },
    { x: 2100, y: 600, width: 200, height: 20 },
    // Walls
    { x: 0, y: 0, width: 20, height: WORLD_HEIGHT },
    { x: WORLD_WIDTH - 20, y: 0, width: 20, height: WORLD_HEIGHT },
  ];
}

function spawnEnemy(wave: number): Enemy {
  const x = 200 + Math.random() * (WORLD_WIDTH - 400);
  const y = 200 + Math.random() * 400;
  return {
    pos: { x, y },
    vel: { x: 0, y: 0 },
    width: 24,
    height: 40,
    health: 30 + wave * 5,
    maxHealth: 30 + wave * 5,
    facing: Math.random() > 0.5 ? 1 : -1,
    shootCooldown: 0,
    aiState: 'patrol',
    patrolDir: Math.random() > 0.5 ? 1 : -1,
  };
}

function spawnPickup(): Pickup {
  return {
    pos: {
      x: 100 + Math.random() * (WORLD_WIDTH - 200),
      y: 300 + Math.random() * 600,
    },
    type: Math.random() > 0.5 ? 'health' : 'ammo',
    collected: false,
  };
}

export function createInitialState(): GameState {
  const enemies: Enemy[] = [];
  for (let i = 0; i < 3; i++) enemies.push(spawnEnemy(1));
  const pickups: Pickup[] = [];
  for (let i = 0; i < 5; i++) pickups.push(spawnPickup());

  return {
    player: {
      pos: { x: 200, y: WORLD_HEIGHT - 100 },
      vel: { x: 0, y: 0 },
      width: 24,
      height: 40,
      health: 100,
      maxHealth: 100,
      ammo: 50,
      maxAmmo: 50,
      fuel: 100,
      maxFuel: 100,
      facing: 1,
      grounded: false,
      shooting: false,
      shootCooldown: 0,
      score: 0,
      aimAngle: 0,
    },
    enemies,
    bullets: [],
    platforms: createPlatforms(),
    particles: [],
    pickups,
    camera: { x: 0, y: 0 },
    keys: new Set(),
    mousePos: { x: 0, y: 0 },
    mouseDown: false,
    gameOver: false,
    wave: 1,
    enemiesKilled: 0,
    paused: false,
    started: false,
  };
}

function rectCollision(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function applyPhysics(
  entity: { pos: { x: number; y: number }; vel: { x: number; y: number }; width: number; height: number },
  platforms: Platform[]
): boolean {
  entity.vel.y += GRAVITY;
  if (entity.vel.y > 15) entity.vel.y = 15;

  entity.pos.x += entity.vel.x;
  for (const p of platforms) {
    if (rectCollision(entity.pos.x, entity.pos.y, entity.width, entity.height, p.x, p.y, p.width, p.height)) {
      if (entity.vel.x > 0) entity.pos.x = p.x - entity.width;
      else entity.pos.x = p.x + p.width;
      entity.vel.x = 0;
    }
  }

  entity.pos.y += entity.vel.y;
  let grounded = false;
  for (const p of platforms) {
    if (rectCollision(entity.pos.x, entity.pos.y, entity.width, entity.height, p.x, p.y, p.width, p.height)) {
      if (entity.vel.y > 0) {
        entity.pos.y = p.y - entity.height;
        grounded = true;
      } else {
        entity.pos.y = p.y + p.height;
      }
      entity.vel.y = 0;
    }
  }
  return grounded;
}

function addParticles(state: GameState, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      pos: { x, y },
      vel: { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 },
      life: 20 + Math.random() * 20,
      maxLife: 40,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

export function updateGame(state: GameState): void {
  if (state.gameOver || state.paused || !state.started) return;

  const { player, keys } = state;

  // Player movement
  player.vel.x = 0;
  if (keys.has('a') || keys.has('arrowleft')) {
    player.vel.x = -PLAYER_SPEED;
    player.facing = -1;
  }
  if (keys.has('d') || keys.has('arrowright')) {
    player.vel.x = PLAYER_SPEED;
    player.facing = 1;
  }
  if ((keys.has('w') || keys.has('arrowup') || keys.has(' ')) && player.grounded) {
    player.vel.y = JUMP_FORCE;
  }

  // Jetpack
  if ((keys.has('w') || keys.has('arrowup') || keys.has(' ')) && !player.grounded && player.fuel > 0) {
    player.vel.y += JETPACK_FORCE;
    player.fuel -= FUEL_DRAIN;
    if (player.fuel < 0) player.fuel = 0;
    addParticles(state, player.pos.x + player.width / 2, player.pos.y + player.height, '#4488ff', 2);
  }

  // Fuel regen on ground
  if (player.grounded && player.fuel < player.maxFuel) {
    player.fuel += FUEL_REGEN;
  }

  player.grounded = applyPhysics(player, state.platforms);

  // Aim angle toward mouse (world coords)
  const worldMouseX = state.mousePos.x + state.camera.x;
  const worldMouseY = state.mousePos.y + state.camera.y;
  player.aimAngle = Math.atan2(
    worldMouseY - (player.pos.y + player.height / 2),
    worldMouseX - (player.pos.x + player.width / 2)
  );
  player.facing = Math.cos(player.aimAngle) >= 0 ? 1 : -1;

  // Shooting
  if (player.shootCooldown > 0) player.shootCooldown--;
  if (state.mouseDown && player.shootCooldown <= 0 && player.ammo > 0) {
    const angle = player.aimAngle;
    state.bullets.push({
      pos: {
        x: player.pos.x + player.width / 2 + Math.cos(angle) * 20,
        y: player.pos.y + player.height / 2 + Math.sin(angle) * 20,
      },
      vel: { x: Math.cos(angle) * BULLET_SPEED, y: Math.sin(angle) * BULLET_SPEED },
      fromPlayer: true,
      life: 60,
    });
    player.shootCooldown = SHOOT_COOLDOWN;
    player.ammo--;
  }

  // Update bullets
  state.bullets = state.bullets.filter(b => {
    b.pos.x += b.vel.x;
    b.pos.y += b.vel.y;
    b.life--;
    if (b.life <= 0) return false;

    // Check platform collision
    for (const p of state.platforms) {
      if (rectCollision(b.pos.x - 2, b.pos.y - 2, 4, 4, p.x, p.y, p.width, p.height)) {
        addParticles(state, b.pos.x, b.pos.y, '#aaa', 3);
        return false;
      }
    }

    if (b.fromPlayer) {
      for (const e of state.enemies) {
        if (rectCollision(b.pos.x - 2, b.pos.y - 2, 4, 4, e.pos.x, e.pos.y, e.width, e.height)) {
          e.health -= 15;
          addParticles(state, b.pos.x, b.pos.y, '#ff4444', 5);
          if (e.health <= 0) {
            addParticles(state, e.pos.x + e.width / 2, e.pos.y + e.height / 2, '#ff6600', 15);
            state.enemiesKilled++;
            player.score += 100;
          }
          return false;
        }
      }
    } else {
      if (rectCollision(b.pos.x - 2, b.pos.y - 2, 4, 4, player.pos.x, player.pos.y, player.width, player.height)) {
        player.health -= 10;
        addParticles(state, b.pos.x, b.pos.y, '#ffcc00', 5);
        if (player.health <= 0) {
          state.gameOver = true;
          addParticles(state, player.pos.x + player.width / 2, player.pos.y + player.height / 2, '#ffcc00', 20);
        }
        return false;
      }
    }
    return true;
  });

  // Remove dead enemies
  state.enemies = state.enemies.filter(e => e.health > 0);

  // Enemy AI
  for (const e of state.enemies) {
    const dx = player.pos.x - e.pos.x;
    const dy = player.pos.y - e.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 400) {
      e.aiState = dist < 200 ? 'shoot' : 'chase';
    } else {
      e.aiState = 'patrol';
    }

    e.facing = dx > 0 ? 1 : -1;

    if (e.aiState === 'patrol') {
      e.vel.x = e.patrolDir * ENEMY_SPEED * 0.5;
      if (Math.random() < 0.01) e.patrolDir *= -1;
    } else if (e.aiState === 'chase') {
      e.vel.x = Math.sign(dx) * ENEMY_SPEED;
      if (dy < -50 && e.vel.y >= 0) e.vel.y = JUMP_FORCE * 0.7;
    } else {
      e.vel.x = 0;
      if (e.shootCooldown <= 0) {
        const angle = Math.atan2(dy, dx);
        state.bullets.push({
          pos: {
            x: e.pos.x + e.width / 2 + Math.cos(angle) * 15,
            y: e.pos.y + e.height / 2 + Math.sin(angle) * 15,
          },
          vel: { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 },
          fromPlayer: false,
          life: 50,
        });
        e.shootCooldown = ENEMY_SHOOT_COOLDOWN;
      }
    }
    if (e.shootCooldown > 0) e.shootCooldown--;

    applyPhysics(e, state.platforms);

    // Keep in bounds
    if (e.pos.x < 30) { e.pos.x = 30; e.patrolDir = 1; }
    if (e.pos.x > WORLD_WIDTH - 50) { e.pos.x = WORLD_WIDTH - 50; e.patrolDir = -1; }
  }

  // Pickups
  for (const p of state.pickups) {
    if (p.collected) continue;
    if (rectCollision(player.pos.x, player.pos.y, player.width, player.height, p.pos.x - 10, p.pos.y - 10, 20, 20)) {
      p.collected = true;
      if (p.type === 'health') {
        player.health = Math.min(player.health + 30, player.maxHealth);
        addParticles(state, p.pos.x, p.pos.y, '#44ff44', 8);
      } else {
        player.ammo = Math.min(player.ammo + 20, player.maxAmmo);
        addParticles(state, p.pos.x, p.pos.y, '#ffaa00', 8);
      }
    }
  }

  // Particles
  state.particles = state.particles.filter(p => {
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;
    p.vel.y += 0.1;
    p.life--;
    return p.life > 0;
  });

  // Wave system
  if (state.enemies.length === 0) {
    state.wave++;
    const count = 3 + state.wave;
    for (let i = 0; i < count; i++) state.enemies.push(spawnEnemy(state.wave));
    // Respawn pickups
    state.pickups = [];
    for (let i = 0; i < 4 + state.wave; i++) state.pickups.push(spawnPickup());
  }

  // Camera follow
  const targetX = player.pos.x - CANVAS_WIDTH / 2 + player.width / 2;
  const targetY = player.pos.y - CANVAS_HEIGHT / 2 + player.height / 2;
  state.camera.x += (targetX - state.camera.x) * 0.1;
  state.camera.y += (targetY - state.camera.y) * 0.1;
  state.camera.x = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH, state.camera.x));
  state.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT, state.camera.y));

  // Keep player in bounds
  if (player.pos.x < 25) player.pos.x = 25;
  if (player.pos.x > WORLD_WIDTH - 45) player.pos.x = WORLD_WIDTH - 45;
  if (player.pos.y > WORLD_HEIGHT) {
    player.health = 0;
    state.gameOver = true;
  }
}
