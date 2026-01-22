import * as pc from 'playcanvas';
import { BaseEnemy } from '../share/BaseEnemy';
import { EnemyRegistry } from '../EnemyRegistry';
import { ResourceManager } from '../../../core/manager/ResourceManager';

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
        const resourceManager = ResourceManager.getInstance();
        const modelAsset = resourceManager.getAsset('bat1');

        if (modelAsset && modelAsset.resource) {
            const container = modelAsset.resource as pc.ContainerResource;
            const modelEntity = container.instantiateRenderEntity();
            modelEntity.setLocalScale(0.8, 0.8, 0.8);
            modelEntity.setLocalEulerAngles(0, 180, 0);
            this.entity.addChild(modelEntity);
            return;
        }

        this.entity.addComponent('model', {
            type: 'capsule'
        });

        this.entity.setLocalScale(0.8, 0.8, 0.8);

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(1, 1, 0);
        material.update();
        this.entity.model!.material = material;
    }
}

EnemyRegistry.register('e_Fast', FastEnemy);
