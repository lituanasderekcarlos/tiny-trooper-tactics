export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  pos: Vector2;
  vel: Vector2;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  fuel: number;
  maxFuel: number;
  facing: 1 | -1;
  grounded: boolean;
  shooting: boolean;
  shootCooldown: number;
  score: number;
  aimAngle: number;
}

export interface Bullet {
  pos: Vector2;
  vel: Vector2;
  fromPlayer: boolean;
  life: number;
}

export interface Enemy {
  pos: Vector2;
  vel: Vector2;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  facing: 1 | -1;
  shootCooldown: number;
  aiState: 'patrol' | 'chase' | 'shoot';
  patrolDir: 1 | -1;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Pickup {
  pos: Vector2;
  type: 'health' | 'ammo';
  collected: boolean;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  platforms: Platform[];
  particles: Particle[];
  pickups: Pickup[];
  camera: Vector2;
  keys: Set<string>;
  mousePos: Vector2;
  mouseDown: boolean;
  gameOver: boolean;
  wave: number;
  enemiesKilled: number;
  paused: boolean;
  started: boolean;
}
