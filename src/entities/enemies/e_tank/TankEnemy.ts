import * as pc from 'playcanvas';
import { BaseEnemy } from '../share/BaseEnemy';

export class TankEnemy extends BaseEnemy {
    initialize() {
        this.stats = {
            currentHealth: 50,
            maxHealth: 50,
            damage: 8,
            defense: 2,
            moveSpeed: 2, // Slower
            expValue: 30
        };

        super.initialize();

        // Visual distinction: Larger and Blue
        this.entity.setLocalScale(1.5, 1.5, 1.5);
        const model = this.entity.model;
        if (model && model.meshInstances && model.meshInstances.length > 0) {
            // Clone material to avoid affecting other instances
            const material = model.meshInstances[0].material.clone() as pc.StandardMaterial;
            material.diffuse.set(0, 0, 1); // Blue
            material.update();
            model.meshInstances[0].material = material;
        }
    }
}
