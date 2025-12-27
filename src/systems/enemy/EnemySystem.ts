import { IGameSystem } from '../../config/types';
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
    private spawnTimer: number = 0;
    private spawnInterval: number = 3.0; // 每 3 秒生成一个敌人

    initialize(): void {
        console.log('[EnemySystem] Initializing...');
        // 可以在这里预加载资源，或者立即生成一些测试敌人
        this.spawnEnemy('fast');
    }

    update(dt: number): void {
        // 1. 生成逻辑
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            // 随机生成
            const type = Math.random() > 0.7 ? 'tank' : 'fast';
            this.spawnEnemy(type);
        }

        // 2. 更新所有敌人
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
}
