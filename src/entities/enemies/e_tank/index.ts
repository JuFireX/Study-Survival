import * as pc from 'playcanvas';
import { BaseEnemy } from '../share/BaseEnemy';
import { EnemyRegistry } from '../EnemyRegistry';

export class TankEnemy extends BaseEnemy {
    constructor() {
        super({
            maxHealth: 100,
            health: 100,
            speed: 1.5, // 较慢
            damage: 15,
            expDrop: 30
        });
    }

    protected setupModel() {
        this.entity.addComponent('model', {
            type: 'box'
        });

        // 大一点
        this.entity.setLocalScale(1.5, 1.5, 1.5);

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(0, 0, 1); // 蓝色
        material.update();
        this.entity.model!.material = material;
    }
}

EnemyRegistry.register('tank', TankEnemy);
