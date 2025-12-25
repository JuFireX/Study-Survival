import { IGameSystem } from '../share/IGameSystem';
import { GameContext } from '../../core/GameContext';
import { EventBus } from '../../core/EventBus';
import { CardEffect } from '../../config/types';
import { WeaponController } from '../../entities/weapons/share/WeaponController';

export class WeaponSystem implements IGameSystem {
    initialize() {
        console.log("WeaponSystem initialized");
        EventBus.getInstance().on('card:applyEffect', this.onApplyEffect, this);
    }

    update(dt: number) {
        void dt;
    }

    private onApplyEffect(effect: CardEffect) {
        // 匹配武器目标：必须以 w_ 开头
        if (!effect.target || !effect.target.startsWith('w_')) return;

        // Apply to player's weapon(s)
        const player = GameContext.getInstance().getPlayer();
        if (player && player.script) {
            // 获取所有 WeaponController (目前只有一个)
            // 注意：playcanvas script.get 只返回一个，如果有多个需用其他方式
            const weaponCtrl = player.script.get('weaponController') as WeaponController;

            if (weaponCtrl) {
                // 检查 ID 匹配
                // 1. w_* 匹配所有
                // 2. w_id 精确匹配
                const targetId = effect.target;
                if (targetId !== 'w_*' && targetId !== weaponCtrl.id) return;

                const key = effect.stat;
                const val = effect.value;

                // 简单的属性修改逻辑
                if (key in weaponCtrl.stats) {
                    if (effect.type === 'add') {
                        (weaponCtrl.stats as any)[key] += val;
                    } else if (effect.type === 'multiply') {
                        (weaponCtrl.stats as any)[key] *= (1 + val);
                    }
                    console.log(`Weapon Upgrade: ${key} -> ${(weaponCtrl.stats as any)[key]}`);
                }
            }
        }
    }
}
