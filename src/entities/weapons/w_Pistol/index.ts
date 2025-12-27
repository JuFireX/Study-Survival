import * as pc from 'playcanvas';
import { BaseWeapon } from '../share/BaseWeapon';
import { PistolBullet } from './PistolBullet';

export { PistolBullet };

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
        // 使用新注册的脚本名称 'pistolBullet'
        const script = bullet.script!.create('pistolBullet') as unknown as PistolBullet;

        if (script) {
            // 使用 setup 方法初始化，避免直接修改属性
            script.setup(
                this.stats.projectileSpeed || 20,
                this.stats.damage,
                this.stats.range,
                this.owner.forward.clone()
            );
        }

        // 5. 添加到场景
        app.root.addChild(bullet);
    }
}
