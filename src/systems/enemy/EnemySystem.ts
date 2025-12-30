import { IGameSystem } from '../../config/types';
import { EventBus } from '../../core/EventBus';
import { GameContext } from '../../core/GameContext';
import { BaseEnemy, FastEnemy, TankEnemy } from '../../entities/enemies';

/**
 * 敌人系统 (EnemySystem)
 * 
 * 职责:
 * 1. 管理所有敌人的生命周期 (生成, 更新, 销毁).
 * 2. 处理波次逻辑 (简单的定时生成).
 */
export class EnemySystem implements IGameSystem {
    private enemies: BaseEnemy[] = [];

    private elapsedTime = 0;
    private spawnTimer = 0;

    private minAlive = 6;
    private maxAlive = 18;
    private maxSpawnPerTick = 2;

    private context: GameContext;
    private eventBus: EventBus;

    constructor() {
        this.context = GameContext.getInstance();
        this.eventBus = this.context.getEventBus();
    }

    initialize(): void {
        console.log(`[EnemySystem] Initializing...`);
        this.eventBus.on('player:hit', this.update, this);

        const initial = Math.max(1, Math.floor(this.minAlive / 2));
        for (let i = 0; i < initial; i++) {
            this.spawnEnemy('fast');
        }
    }

    update(dt: number): void {
        this.elapsedTime += dt;

        // 1) 生成逻辑：用“目标存活数”控制密度，避免一波太多/太少
        const spawnInterval = this.getSpawnIntervalSeconds();
        this.spawnTimer += dt;

        while (this.spawnTimer >= spawnInterval) {
            this.spawnTimer -= spawnInterval;
            this.spawnUpToTarget();
        }

        // 2) 更新所有敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.isAlive()) {
                enemy.update(dt);
            } else {
                // 移除死亡的敌人
                this.enemies.splice(i, 1);
            }
        }
    }

    private spawnEnemy(type: string) {
        let enemy: BaseEnemy;

        switch (type) {
            case 'fast':
                enemy = new FastEnemy();
                break;
            case 'tank':
                enemy = new TankEnemy();
                break;
            default:
                console.warn(`[EnemySystem] Unknown enemy type: ${type}`);
                return;
        }

        // 随机生成位置 (在玩家周围一定距离)
        const player = GameContext.getInstance().getPlayer();
        if (player) {
            const playerPos = player.getPosition();
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 10; // 15~25 米范围

            const x = playerPos.x + Math.cos(angle) * distance;
            const z = playerPos.z + Math.sin(angle) * distance;

            enemy.setPosition(x, 1, z);
        } else {
            // 如果没有玩家，随机放在原点附近
            enemy.setPosition((Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20);
        }

        this.enemies.push(enemy);
        console.log(`[EnemySystem] Spawned ${type} enemy. Total: ${this.enemies.length}`);
    }

    private getTargetAliveCount(): number {
        const ramp = Math.floor(this.elapsedTime / 15);
        const target = this.minAlive + ramp;
        return Math.max(this.minAlive, Math.min(this.maxAlive, target));
    }

    private getSpawnIntervalSeconds(): number {
        const t = this.elapsedTime;
        const min = 0.45;
        const max = 1.2;
        const normalized = Math.min(1, Math.max(0, t / 120));
        return max - (max - min) * normalized;
    }

    private pickEnemyType(): string {
        const baseTankChance = 0.1;
        const maxTankChance = 0.35;
        const ramp = Math.min(1, Math.max(0, this.elapsedTime / 180));
        const tankChance = baseTankChance + (maxTankChance - baseTankChance) * ramp;
        return Math.random() < tankChance ? 'tank' : 'fast';
    }

    private spawnUpToTarget(): void {
        const alive = this.enemies.length;
        if (alive >= this.maxAlive) return;

        const targetAlive = this.getTargetAliveCount();
        const clampedTarget = Math.min(this.maxAlive, targetAlive);

        let missing = clampedTarget - alive;
        if (alive < this.minAlive) {
            missing = Math.max(missing, this.minAlive - alive);
        }

        if (missing <= 0) return;

        const spawnCount = Math.min(this.maxSpawnPerTick, missing);
        for (let i = 0; i < spawnCount; i++) {
            this.spawnEnemy(this.pickEnemyType());
        }
    }
}

