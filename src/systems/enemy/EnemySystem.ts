<<<<<<< Updated upstream
=======
import * as pc from 'playcanvas';
import type { IGameSystem } from '../../config/types';
import { GameContext } from '../../core/GameContext';
import type { EventBus } from '../../core/EventBus';
import type { UIManager } from '../../core/manager/UIManager';
import { BaseEnemy, FastEnemy, TankEnemy } from '../../entities/enemies';
type EnemyKind = 'fast' | 'tank';
>>>>>>> Stashed changes

/**
 * 敌人系统 (EnemySystem)
 * 
 * 职责:
 * 1. 管理实体及其状态: 所有敌人 (健康、能量、状态效果)
 * 2. 可供调配的UI: 敌人状态UI (血条, 伤害跳字等)
 * 3. 敌人波次管理: 控制敌人的生成, 波次之间的间隔, 敌人的数量等
 * 
 * 由于敌人有自己的行为树, 所以这里应该调用敌人的帧更新方法, 可以统一管理敌人的血量, 死亡, 生成经验球等事件
 */
<<<<<<< Updated upstream
=======
export class EnemySystem implements IGameSystem {
    private app: pc.Application;
    private eventBus: EventBus;
    private ui: UIManager|null = null;

    private enemies: BaseEnemy[] = [];
    private enemyByEntity: WeakMap<pc.Entity, BaseEnemy> = new WeakMap();

    private spawnTimer: number = 0;
    private waveTimer: number = 0;
    private waveIndex: number = 0;
    private inRest: boolean = false;

    private readonly maxAlive: number = 30;
    private readonly waveDuration: number = 25;
    private readonly restDuration: number = 5;
    private readonly spawnIntervalBase: number = 0.6;
    private readonly spawnRadius: number = 18;
    private readonly despawnRadius: number = 80;

    constructor() {
        const context = GameContext.getInstance();
        this.app = context.getApp();
        this.eventBus = context.getEventBus();
        this.ui = context.getUIManager();
    }

    public initialize(): void {
        this.eventBus.on('enemy:spawn', this.onSpawnRequested, this);
        this.eventBus.on('enemy:clear', this.onClearRequested, this);
        this.eventBus.on('combat:damageEnemy', this.onDamageEnemy, this);

        this.waveIndex = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.inRest = false;

        void this.ui;
    }

    public update(dt: number): void {
        const player = GameContext.getInstance().getPlayer();
        if (!player) {
            this.spawnTimer = 0;
            return;
        }

        const playerPos = player.getPosition();
        this.updateWave(dt);

        if (!this.inRest) {
            this.spawnTimer += dt;
            const interval = this.getSpawnInterval();
            while (this.spawnTimer >= interval && this.enemies.length < this.maxAlive) {
                this.spawnTimer -= interval;
                this.spawnOne(playerPos);
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.isDead()) {
                this.handleDeath(enemy);
                this.enemies.splice(i, 1);
                continue;
            }

            const enemyPos = enemy.getEntity().getPosition();
            const dx = enemyPos.x - playerPos.x;
            const dz = enemyPos.z - playerPos.z;
            if ((dx * dx + dz * dz) > this.despawnRadius * this.despawnRadius) {
                enemy.destroy();
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.update(dt, playerPos);
        }
    }

    private updateWave(dt: number) {
        this.waveTimer += dt;

        if (!this.inRest && this.waveTimer >= this.waveDuration) {
            this.inRest = true;
            this.waveTimer = 0;
            return;
        }

        if (this.inRest && this.waveTimer >= this.restDuration) {
            this.inRest = false;
            this.waveTimer = 0;
            this.waveIndex += 1;
        }
    }

    private getSpawnInterval(): number {
        const scale = Math.max(0.35, 1 - (this.waveIndex - 1) * 0.06);
        return this.spawnIntervalBase * scale;
    }

    private spawnOne(playerPos: pc.Vec3) {
        const kind = this.chooseKind();
        const enemy = this.createEnemy(kind);
        enemy.initialize();

        const spawnPos = this.pickSpawnPos(playerPos);
        enemy.setPosition(spawnPos);

        this.app.root.addChild(enemy.getEntity());
        this.enemies.push(enemy);
        this.enemyByEntity.set(enemy.getEntity(), enemy);

        this.eventBus.fire('enemy:spawned', enemy.getEntity(), enemy.getStats(), kind);
    }

    private chooseKind(): EnemyKind {
        const tankChance = Math.min(0.4, 0.1 + (this.waveIndex - 1) * 0.04);
        return Math.random() < tankChance ? 'tank' : 'fast';
    }

    private createEnemy(kind: EnemyKind): BaseEnemy {
        if (kind === 'tank') {
            return new TankEnemy();
        }
        return new FastEnemy();
    }

    private pickSpawnPos(playerPos: pc.Vec3): pc.Vec3 {
        const angle = Math.random() * Math.PI * 2;
        const radius = this.spawnRadius * (0.7 + Math.random() * 0.6);
        const x = playerPos.x + Math.cos(angle) * radius;
        const z = playerPos.z + Math.sin(angle) * radius;
        return new pc.Vec3(x, 1, z);
    }

    private handleDeath(enemy: BaseEnemy) {
        const entity = enemy.getEntity();
        const pos = entity.getPosition().clone();
        const expValue = enemy.getStats().expValue;
        enemy.destroy();
        this.eventBus.fire('enemy:died', entity, pos, expValue);
    }

    private onSpawnRequested(kind: EnemyKind | 'random' = 'random', count: number = 1) {
        const player = GameContext.getInstance().getPlayer();
        if (!player) return;

        const playerPos = player.getPosition();
        const spawnCount = Math.max(0, Math.floor(count));
        for (let i = 0; i < spawnCount && this.enemies.length < this.maxAlive; i++) {
            const actualKind = kind === 'random' ? this.chooseKind() : kind;
            const enemy = this.createEnemy(actualKind);
            enemy.initialize();
            enemy.setPosition(this.pickSpawnPos(playerPos));
            this.app.root.addChild(enemy.getEntity());
            this.enemies.push(enemy);
            this.enemyByEntity.set(enemy.getEntity(), enemy);
            this.eventBus.fire('enemy:spawned', enemy.getEntity(), enemy.getStats(), actualKind);
        }
    }

    private onClearRequested() {
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies = [];
        this.enemyByEntity = new WeakMap();
        this.spawnTimer = 0;
    }

    private onDamageEnemy(target: pc.Entity, rawDamage: number, color: string = 'white') {
        const enemy = this.enemyByEntity.get(target) ?? (target as any).__enemy;
        if (!enemy) return;

        enemy.takeDamage(rawDamage, color);
    }
}
>>>>>>> Stashed changes



