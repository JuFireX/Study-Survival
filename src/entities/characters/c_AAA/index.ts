import * as pc from 'playcanvas';
import { BaseCharacter } from '../share/BaseCharacter';
import { PlayerStats } from '../../../config/types';

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
        // 如果实体没有模型，添加一个简单的胶囊体作为占位
        if (!this.entity.model) {
            this.entity.addComponent('model', {
                type: 'capsule',
            });
            
            // 添加材质颜色区分
            const material = new pc.StandardMaterial();
            material.diffuse = new pc.Color(0.2, 0.6, 1.0); // 蓝色
            material.update();
            this.entity.model!.material = material;
        }
    }

    public update(dt: number) {
        super.update(dt);
        // AAA 特有的逻辑
    }
}
