import * as pc from 'playcanvas';
import { BaseCharacter } from '../share/BaseCharacter';
import { PlayerStats } from '../../../config/types';
import { CharacterRegistry } from '../CharacterRegistry';

export class CharacterAAA extends BaseCharacter {
    constructor(entity: pc.Entity, stats?: Partial<PlayerStats>) {
        const defaultStats: PlayerStats = {
            currentHealth: 100,
            maxHealth: 100,
            defense: 5,
            magicDefense: 0,
            moveSpeed: 8, // 稍微快一点
            pickupRange: 3,
            expEfficiency: 1.0,
            luck: 0
        };
        super(entity, { ...defaultStats, ...stats });
        this.initializeVisuals();
    }

    private initializeVisuals() {
        // 创建一个简单的胶囊体代表角色
        this.entity.addComponent('model', {
            type: 'capsule'
        });

        // 设置胶囊体颜色为青色
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(60 / 255, 90 / 255, 250 / 255);
        material.update();
        if (this.entity.model) {
            this.entity.model.material = material;
        }

        // 添加一个小眼睛指示方向
        const eye = new pc.Entity('Eye');
        eye.addComponent('model', { type: 'box' });
        eye.setLocalScale(0.5, 0.2, 0.5);
        eye.setLocalPosition(0, 0.5, 0.3);
        const eyeMat = new pc.StandardMaterial();
        eyeMat.diffuse = new pc.Color(200 / 255, 200 / 255, 200 / 255);
        eyeMat.update();
        if (eye.model) eye.model.material = eyeMat;
        this.entity.addChild(eye);
    }
}

// 自动注册
CharacterRegistry.register('c_AAA', CharacterAAA);
