import * as pc from 'playcanvas';
import { BaseEnemy } from '../share/BaseEnemy';
import { EnemyRegistry } from '../EnemyRegistry';

export class FastEnemy extends BaseEnemy {
    constructor() {
        super({
            maxHealth: 30,
            health: 30,
            speed: 4.0, // 较快
            damage: 5,
            expDrop: 10
        });
    }

    protected setupModel() {
        this.entity.addComponent('model', {
            type: 'capsule' // 用胶囊体区分
        });

        // 稍微瘦一点
        this.entity.setLocalScale(0.8, 0.8, 0.8);

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(1, 1, 0);
        material.update();
        this.entity.model!.material = material;
    }
}

EnemyRegistry.register('e_Fast', FastEnemy);
