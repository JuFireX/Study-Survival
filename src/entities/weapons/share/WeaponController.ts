import * as pc from 'playcanvas';
import { BulletBehavior } from './BulletBehavior';
import { GameplayConfig } from '../../../config/gameplay';

/**
 * 武器控制器
 * 负责寻找最近的敌人并自动射击。
 */
export class WeaponController extends pc.ScriptType {
    range: number = GameplayConfig.Weapon.Default.Range;
    cooldown: number = GameplayConfig.Weapon.Default.Cooldown;
    timer: number = 0;
    damage: number = GameplayConfig.Weapon.Default.Damage;

    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.cooldown) {
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
                if (dst < this.range && dst < minDst) {
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
        bullet.setLocalScale(0.2, 0.2, 0.2);
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
            script.damage = this.damage;
        }
    }
}
