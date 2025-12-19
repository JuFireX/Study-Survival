import * as pc from 'playcanvas';
import { IGameSystem } from './IGameSystem';
import { GameContext } from '../core/GameContext';
import { EnemyBehavior } from '../scripts/components/EnemyBehavior';

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
        enemy.addComponent('model', { type: 'box' });

        // 在玩家周围随机生成
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 5;
        const playerPos = player.getPosition();
        const x = playerPos.x + Math.cos(angle) * dist;
        const z = playerPos.z + Math.sin(angle) * dist;

        enemy.setPosition(x, 1, z);

        // 添加脚本
        enemy.addComponent('script');
        const script = enemy.script!.create('enemyBehavior') as EnemyBehavior;
        if (script) {
            script.setup(player);
        }

        // 设置颜色（红色）
        const material = new pc.StandardMaterial();
        material.diffuse.set(1, 0, 0);
        material.update();
        if (enemy.model) {
            enemy.model.material = material;
        }

        this.app.root.addChild(enemy);
    }
}
