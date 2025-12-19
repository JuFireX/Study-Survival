import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { GameContext } from '../core/GameContext';
// import { EnemyBehavior } from '../scripts/components/EnemyBehavior';
import { FastEnemy } from '../scripts/enemies/FastEnemy';
import { TankEnemy } from '../scripts/enemies/TankEnemy';

/**
 * 敌人生成系统
 * 负责管理敌人的生成波次、生成位置和生成逻辑。
 */
export class SpawnSystem implements IGameSystem {
    private app: pc.Application;
    private timer: number = 0;
    private spawnInterval: number = 2; // 每2秒生成一个敌人

    constructor() {
        this.app = GameContext.getInstance().getApp();
    }

    initialize() {
        console.log("SpawnSystem initialized");
    }

    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.spawnInterval) {
            this.spawnEnemy();
            this.timer = 0;
        }
    }

    /**
     * 生成一个敌人
     */
    private spawnEnemy() {
        const player = GameContext.getInstance().getPlayer();
        if (!player) return;

        const enemy = new pc.Entity('Enemy');

        // Randomly choose enemy type
        const type = Math.random() < 0.7 ? 'fast' : 'tank';

        if (type === 'fast') {
            enemy.addComponent('model', { type: 'sphere' }); // Visual distinction
        } else {
            enemy.addComponent('model', { type: 'box' });
        }

        // 在玩家周围随机生成
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 5;
        const playerPos = player.getPosition();
        const x = playerPos.x + Math.cos(angle) * dist;
        const z = playerPos.z + Math.sin(angle) * dist;

        enemy.setPosition(x, 1, z);

        // 添加脚本
        enemy.addComponent('script');

        if (type === 'fast') {
            const script = enemy.script!.create('fastEnemy') as FastEnemy;
            if (script) script.setup(player);
        } else {
            const script = enemy.script!.create('tankEnemy') as TankEnemy;
            if (script) script.setup(player);
        }

        this.app.root.addChild(enemy);
    }
}
