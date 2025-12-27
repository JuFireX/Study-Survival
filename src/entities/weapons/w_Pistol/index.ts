import * as pc from 'playcanvas';
import { BaseWeapon } from '../share/BaseWeapon';
import { PistolBullet } from './PistolBullet';

export { PistolBullet };

export class Pistol extends BaseWeapon {

    protected attack(): void {
        const app = pc.Application.getApplication();
        if (!app) return;

        // 1. 索敌逻辑：寻找最近的敌人
        let targetPos = null;
        const enemies = app.root.findByTag('enemy');
        let minDistSq = Infinity;
        const ownerPos = this.owner.getPosition();
        const searchRangeSq = (this.stats.range || 20) * (this.stats.range || 20);

        for (const enemy of enemies) {
            const distSq = new pc.Vec3().sub2(enemy.getPosition(), ownerPos).lengthSq();
            if (distSq < minDistSq && distSq <= searchRangeSq) {
                minDistSq = distSq;
                targetPos = enemy.getPosition();
            }
        }

        // 2. 确定射击方向
        let shootDir: pc.Vec3;
        if (targetPos) {
            // 朝向最近的敌人
            shootDir = new pc.Vec3().sub2(targetPos, ownerPos).normalize();
        } else {
            // 默认朝向持有者前方
            shootDir = this.owner.forward.clone();
        }

        // 3. 创建子弹实体
        const bullet = new pc.Entity('PistolBullet');

        // 4. 添加视觉模型 (这里用简单的球体代替)
        bullet.addComponent('model', { type: 'sphere' });
        bullet.setLocalScale(0.3, 0.3, 0.3);

        // 5. 设置初始位置 (从拥有者位置发射)
        // 假设发射点在角色前方一点，高度适中
        const spawnPos = ownerPos.clone().add(shootDir.clone().mulScalar(0.5));
        spawnPos.y += 0.0; // 降低高度
        bullet.setPosition(spawnPos);

        // 6. 添加子弹行为脚本
        bullet.addComponent('script');
        // 使用新注册的脚本名称 'pistolBullet'
        const script = bullet.script!.create('pistolBullet') as unknown as PistolBullet;

        if (script) {
            // 使用 setup 方法初始化，避免直接修改属性
            script.setup(
                this.stats.projectileSpeed || 20,
                this.stats.damage,
                this.stats.range,
                shootDir // 传入计算好的方向
            );
        }

        // 7. 添加到场景
        app.root.addChild(bullet);
    }
}
