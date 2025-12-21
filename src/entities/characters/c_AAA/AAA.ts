import * as pc from 'playcanvas';
import { BaseCharacter } from '../share/BaseCharacter';

export class AAA extends BaseCharacter {
    initialize() {
        if (!this.entity.model) {
            this.entity.addComponent('model', { type: 'capsule' });
        }

        this.entity.setLocalScale(1.1, 1.1, 1.1);

        super.initialize();
    }

    protected applyCharacterStyle() {
        const model = this.entity.model;
        const meshInstances = model?.meshInstances ?? [];

        for (const mi of meshInstances) {
            const mat = mi.material as pc.StandardMaterial;
            mat.diffuse.set(0.65, 0.2, 1);
            mat.emissive.set(0.25, 0.05, 0.4);
            mat.update();
        }
    }
}