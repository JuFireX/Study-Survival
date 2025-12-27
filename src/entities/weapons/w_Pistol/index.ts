import * as pc from 'playcanvas';
import { BaseWeapon } from '../share/BaseWeapon';
import '../share/BulletBehavior'; // Ensure script is registered

export class Pistol extends BaseWeapon {

    protected attack(): void {
        const app = pc.Application.getApplication();
        if (!app) return;

        // 1. 创建子弹实体
        const bullet = new pc.Entity('PistolBullet');

        // 2. 添加视觉模型 (这里用简单的球体代替)
        bullet.addComponent('model', { type: 'sphere' });
        bullet.setLocalScale(0.3, 0.3, 0.3);

        // 3. 设置初始位置 (从拥有者位置发射)
        const ownerPos = this.owner.getPosition();
        // 假设发射点在角色前方一点，高度适中
        const spawnPos = ownerPos.clone().add(this.owner.forward.clone().mulScalar(0.5));
        spawnPos.y += 1.0;
        bullet.setPosition(spawnPos);

        // 4. 添加子弹行为脚本
        bullet.addComponent('script');
        bullet.script!.create('bulletBehavior', {
            attributes: {
                speed: this.stats.projectileSpeed || 20,
                damage: this.stats.damage,
                range: this.stats.range,
                direction: this.owner.forward.clone() // 默认向角色前方发射
            }
        });

        // 5. 添加到场景
        app.root.addChild(bullet);
    }
}
