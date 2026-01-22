import * as pc from 'playcanvas';
import { BaseCharacter } from '../share/BaseCharacter';
import { PlayerStats } from '../../../config/types';
import { CharacterRegistry } from '../CharacterRegistry';
import { ResourceManager } from '../../../core/manager/ResourceManager';

export class CharacterAAA extends BaseCharacter {
    constructor(entity: pc.Entity, stats?: Partial<PlayerStats>) {
        const defaultStats: PlayerStats = {
            currentHealth: 100,
            maxHealth: 100,
            defense: 5,
            magicDefense: 0,
            moveSpeed: 8,
            pickupRange: 3,
            expEfficiency: 1.0,
            luck: 0
        };
        super(entity, { ...defaultStats, ...stats });
        this.initializeVisuals();
    }

    private initializeVisuals() {
        const resourceManager = ResourceManager.getInstance();
        const modelAsset = resourceManager.getAsset('barbarian');

        if (modelAsset && modelAsset.resource) {
            const container = modelAsset.resource as pc.ContainerResource;
            const modelEntity = container.instantiateRenderEntity();
            modelEntity.setLocalScale(1.5, 1.5, 1.5);
            modelEntity.setLocalEulerAngles(-90, 0, 0);
            this.entity.addChild(modelEntity);
            return;
        }

        this.entity.addComponent('model', {
            type: 'capsule'
        });

        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color(60 / 255, 90 / 255, 250 / 255);
        material.update();
        if (this.entity.model) {
            this.entity.model.material = material;
        }

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
