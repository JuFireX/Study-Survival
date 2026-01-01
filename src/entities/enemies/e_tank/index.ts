import * as pc from 'playcanvas';
import { BaseEnemy } from '../share/BaseEnemy';
import { EnemyRegistry } from '../EnemyRegistry';

export class TankEnemy extends BaseEnemy {
    constructor() {
        super({
            maxHealth: 100,
            health: 100,
            speed: 1.5,
            damage: 10,
            expDrop: 50
        });
    }

    protected setupModel() {
        this.entity.addComponent('model', {
            type: 'box'
        });

        // 大一点
        this.entity.setLocalScale(1.0, 1.5, 1.0);

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0, 0, 1);
        material.update();
        this.entity.model!.material = material;
    }
}

EnemyRegistry.register('e_Tank', TankEnemy);
