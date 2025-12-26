import * as pc from 'playcanvas';
import { BulletBehavior } from './BulletBehavior';
import { GameplayConfig } from '../../../config/gameplay';
import { WeaponStats } from '../../../config/types';

/**
 * 武器控制器
 * 负责寻找最近的敌人并自动射击。
 */
export class WeaponController extends pc.ScriptType {
    // 武器ID，用于精确匹配卡牌效果
    id: string = 'w_sword';

    // 使用 WeaponStats 统一管理属性
    stats: WeaponStats = {
        damage: GameplayConfig.Weapon.default.damage || 10,
        cooldown: GameplayConfig.Weapon.default.cooldown || 0.5,
        range: GameplayConfig.Weapon.default.range || 10,
        projectileSpeed: GameplayConfig.Weapon.default.projectileSpeed || 20,
        projectileCount: 1,
        pierceCount: 0,
        areaSize: 1
    };

    timer: number = 0;

    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.stats.cooldown) {
            this.shoot();
            this.timer = 0;
        }
    }

    /**
     * 执行射击逻辑
     */
    shoot() {
        // 简单遍历场景图寻找敌人（性能较差，生产环境建议使用空间分区或列表管理）
        const children = this.app.root.children;
        let closest: pc.Entity | null = null;
        let minDst = Infinity;
        const myPos = this.entity.getPosition();

        for (const child of children) {
            if (child.name === 'Enemy') {
                const dst = myPos.distance(child.getPosition());
                if (dst < this.stats.range && dst < minDst) {
                    minDst = dst;
                    closest = child as pc.Entity;
                }
            }
        }

        if (closest) {
            this.spawnProjectile(closest);
        }
    }

    /**
     * 生成子弹
     * @param target 目标实体
     */
    spawnProjectile(target: pc.Entity) {
        const bullet = new pc.Entity('Bullet');
        bullet.addComponent('model', { type: 'sphere' });
        // 根据 areaSize 调整大小
        const scale = 0.2 * this.stats.areaSize;
        bullet.setLocalScale(scale, scale, scale);
        bullet.setPosition(this.entity.getPosition());

        // 设置黄色材质
        const material = new pc.StandardMaterial();
        material.emissive.set(1, 1, 0);
        material.update();
        if (bullet.model) bullet.model.material = material;

        this.app.root.addChild(bullet);

        // 添加子弹脚本
        bullet.addComponent('script');
        const script = bullet.script!.create('bulletBehavior') as BulletBehavior;
        if (script) {
            script.target = target;
            // 伤害快照：将当前武器面板伤害传递给子弹
            script.damage = this.stats.damage;
            script.speed = this.stats.projectileSpeed;
        }
    }
}
