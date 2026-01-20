import * as pc from 'playcanvas';
import { BaseWeapon } from '../share/BaseWeapon';
import { WeaponRegistry } from '../WeaponRegistry';

export class Sword extends BaseWeapon {

    protected attack(): void {
        console.log(`[Sword] Slash! Damage: ${this.stats.damage}`);

        const app = pc.Application.getApplication();
        if (!app) return;

        // 1. 创建挥砍特效实体
        const slash = new pc.Entity('SwordSlash');
        // 用一个扁平的立方体模拟刀光
        slash.addComponent('model', { type: 'box' });
        // 范围大小由 stats.areaSize 决定，默认为 2
        const size = this.stats.areaSize || 2;
        slash.setLocalScale(size, 0.1, size);

        // 2. 位置设置在角色前方
        const ownerPos = this.owner.getPosition();
        const forward = this.owner.forward;
        const slashPos = ownerPos.clone().add(forward.clone().mulScalar(1.5));
        slashPos.y += 1.0;
        slash.setPosition(slashPos);

        // 3. 旋转以匹配角色朝向
        slash.setRotation(this.owner.getRotation());

        app.root.addChild(slash);

        // 4. 伤害判定 (AOE)
        // 获取所有敌人
        const enemies = app.root.findByTag('enemy');
        const rangeSq = size * size; // 简单用范围平方近似

        enemies.forEach(enemyEntity => {
            const distSq = new pc.Vec3().sub2(enemyEntity.getPosition(), slashPos).lengthSq();
            if (distSq < rangeSq) {
                // 触发实体伤害事件
                enemyEntity.fire('damage', this.stats.damage);
            }
        });

        // 5. 短暂延迟后销毁特效
        setTimeout(() => {
            if (slash) slash.destroy();
        }, 200); // 200ms 持续时间
    }
}

WeaponRegistry.register('w_sword', Sword);
