import * as pc from 'playcanvas';
import { BaseEnemy } from '../share/BaseEnemy';

export class FastEnemy extends BaseEnemy {
    initialize() {
        this.stats = {
            currentHealth: 15,
            maxHealth: 15,
            damage: 3,
            defense: 0,
            moveSpeed: 6, // Faster
            expValue: 15
        };

        super.initialize();

        // Visual distinction: Smaller and Yellow
        this.entity.setLocalScale(0.7, 0.7, 0.7);
        const model = this.entity.model;
        if (model && model.meshInstances && model.meshInstances.length > 0) {
            const material = model.meshInstances[0].material.clone() as pc.StandardMaterial;
            material.diffuse.set(1, 1, 0); // Yellow
            material.update();
            model.meshInstances[0].material = material;
        }
    }
}
