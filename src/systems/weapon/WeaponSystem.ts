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
        if (effect.target !== 'weapon') return;

        // Apply to player's weapon(s)
        const player = GameContext.getInstance().getPlayer();
        if (player && player.script) {
            const weaponCtrl = player.script.get('weaponController') as WeaponController;
            if (weaponCtrl) {
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
