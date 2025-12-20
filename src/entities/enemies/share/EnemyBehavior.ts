import * as pc from 'playcanvas';
import { GameplayConfig } from '../../../config/gameplay';

/**
 * 敌人行为脚本
 * 简单的追逐玩家 AI。
 */
export class EnemyBehavior extends pc.ScriptType {
    player: pc.Entity | null = null;
    speed: number = GameplayConfig.Enemy.BaseSpeed;

    initialize() {
    }

    /**
     * 设置目标
     * @param player 玩家实体
     */
    setup(player: pc.Entity) {
        this.player = player;
    }

    update(dt: number) {
        if (!this.player) return;

        const pos = this.entity.getPosition();
        const target = this.player.getPosition();

        // 计算朝向玩家的方向向量
        const dir = new pc.Vec3().sub2(target, pos);
        dir.y = 0; // 保持在水平面上，不飞行也不下沉

        if (dir.length() > 0.1) {
            dir.normalize().mulScalar(this.speed * dt);
            this.entity.translate(dir);
            // 面向玩家
            this.entity.lookAt(target.x, pos.y, target.z);
        }
    }
}
